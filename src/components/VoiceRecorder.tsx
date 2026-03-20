import { useState, useRef, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  onConfirmed: (text: string, audioBlob: Blob) => void;
}

type RecordingState = "idle" | "recording" | "reviewing" | "confirmed";

const VoiceRecorder = ({ onConfirmed }: VoiceRecorderProps) => {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctedText, setCorrectedText] = useState("");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_SECONDS = 20;

  const getSupportedMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const recordedType = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: recordedType });
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setState("reviewing");
        transcribeAudio(blob);
      };

      mediaRecorder.start(100);
      setState("recording");
      setElapsed(0);

      timerRef.current = window.setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_SECONDS - 1) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reRecord = useCallback(() => {
    setAudioUrl(null);
    audioBlobRef.current = null;
    setState("idle");
    setElapsed(0);
    setTranscript("");
    setIsCorrect(null);
    setCorrectedText("");
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audio_base64: base64 },
      });

      if (error) throw error;
      let text = (data.transcription || "").trim();
      if (text && !text.endsWith("?")) {
        text += "?";
      }
      setTranscript(text);
    } catch (err) {
      console.error("Transcription error:", err);
      setTranscript("");
    } finally {
      setTranscribing(false);
    }
  };

  const handleConfirm = () => {
    const finalText = isCorrect === false ? correctedText : transcript;
    if (!finalText.trim() || !audioBlobRef.current) return;
    setState("confirmed");
    onConfirmed(finalText.trim(), audioBlobRef.current);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Idle / Recording state */}
      {(state === "idle" || state === "recording") && (
        <>
          <div className="relative">
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
              state === "recording"
                ? "bg-coral/30 animate-ping"
                : "bg-primary/20 animate-pulse"
            }`} style={{ margin: "-16px", borderRadius: "9999px" }} />
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              state === "idle" ? "bg-primary/10 animate-pulse [animation-delay:0.5s]" : "hidden"
            }`} style={{ margin: "-32px", borderRadius: "9999px" }} />
            <button
              onClick={state === "idle" ? startRecording : stopRecording}
              className={`relative w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 storybook-shadow ${
                state === "recording"
                  ? "bg-coral scale-110"
                  : "bg-primary hover:scale-110"
              }`}
            >
              {state === "recording" ? (
                <Square className="w-12 h-12 text-coral-foreground" />
              ) : (
                <Mic className="w-14 h-14 text-primary-foreground" />
              )}
            </button>

            {state === "recording" && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <span className="font-display font-bold text-coral text-xl">
                  {elapsed}s / {MAX_SECONDS}s
                </span>
              </div>
            )}
          </div>

          <p className="font-display text-base text-muted-foreground mt-6 font-semibold">
            {state === "idle" ? "Tap the microphone to start! 🎙️" : "Recording... tap to stop! 🛑"}
          </p>
        </>
      )}

      {/* Reviewing state */}
      {state === "reviewing" && (
        <div className="w-full space-y-6">
          {/* Playback */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center storybook-shadow hover:scale-105 transition-all"
            >
              {playing ? (
                <Pause className="w-8 h-8 text-primary-foreground" />
              ) : (
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              )}
            </button>
            <p className="font-display text-sm text-muted-foreground">
              Listen back to the recording
            </p>
          </div>

          {/* Transcript */}
          <div className="bg-background rounded-xl p-4 border border-input">
            <label className="block font-display font-semibold text-sm mb-2">
              We heard:
            </label>
            {transcribing ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 rounded-full bg-secondary animate-bounce" />
                <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:0.1s]" />
                <div className="w-4 h-4 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                <span className="text-sm text-muted-foreground ml-2 font-display">
                  Listening carefully...
                </span>
              </div>
            ) : (
              <p className="text-foreground text-base leading-relaxed min-h-[2rem]">
                {transcript || (
                  <span className="text-muted-foreground italic">
                    Couldn't catch that — please type the question below.
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Confirm / Correct */}
          {!transcribing && (
            <div className="space-y-4">
              <p className="font-display font-semibold text-sm text-center">
                Is this what they asked?
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant={isCorrect === true ? "default" : "outline"}
                  onClick={() => setIsCorrect(true)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Yes, that's right
                </Button>
                <Button
                  variant={isCorrect === false ? "secondary" : "outline"}
                  onClick={() => {
                    setIsCorrect(false);
                    setCorrectedText(transcript);
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  No, let me fix it
                </Button>
              </div>

              {isCorrect === false && (
                <div>
                  <label className="block font-display font-semibold text-sm mb-2">
                    What did they ask?
                  </label>
                  <textarea
                    value={correctedText}
                    onChange={(e) => setCorrectedText(e.target.value)}
                    placeholder="Type the question here..."
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-center pt-2">
                <Button variant="ghost" size="sm" onClick={reRecord} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Re-record
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={
                    isCorrect === null ||
                    (isCorrect === true && !transcript.trim()) ||
                    (isCorrect === false && !correctedText.trim())
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmed state */}
      {state === "confirmed" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-display">
          <Check className="w-4 h-4 text-sage" />
          Question confirmed
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
};

export default VoiceRecorder;

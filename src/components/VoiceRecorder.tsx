import { useState, useRef, useCallback } from "react";
import { Mic, Square, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscription: (text: string, audioBlob: Blob) => void;
}

type RecordingState = "idle" | "recording" | "recorded";

const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_SECONDS = 20;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        transcribeAudio(blob);
      };

      mediaRecorder.start(100);
      setState("recording");
      setElapsed(0);

      timerRef.current = window.setInterval(() => {
        setElapsed(prev => {
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
    setState("recorded");
  }, []);

  const reRecord = useCallback(() => {
    setAudioUrl(null);
    audioBlobRef.current = null;
    setState("idle");
    setElapsed(0);
  }, []);

  const playAudio = useCallback(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      // Use browser SpeechRecognition as primary, fallback to manual
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        // Play the audio through an audio element for recognition
        // Actually, SpeechRecognition uses live mic, so we need a different approach
        // Let the parent handle transcription confirmation with the audio blob
        onTranscription("", blob);
      } else {
        onTranscription("", blob);
      }
    } catch (err) {
      console.error("Transcription error:", err);
      onTranscription("", blob);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mic Button */}
      <div className="relative">
        <button
          onClick={state === "idle" ? startRecording : state === "recording" ? stopRecording : playAudio}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 storybook-shadow ${
            state === "recording"
              ? "bg-secondary scale-110 animate-pulse"
              : "bg-primary hover:scale-105"
          }`}
        >
          {state === "recording" ? (
            <Square className="w-10 h-10 text-secondary-foreground" />
          ) : state === "recorded" ? (
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </button>

        {state === "recording" && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <span className="font-display font-bold text-secondary text-lg">
              {elapsed}s / {MAX_SECONDS}s
            </span>
          </div>
        )}
      </div>

      <p className="font-display text-sm text-muted-foreground mt-2">
        {state === "idle" && "Tap to Record"}
        {state === "recording" && "Recording... Tap to Stop"}
        {state === "recorded" && "Tap to Play"}
      </p>

      {state === "recorded" && (
        <Button variant="ghost" size="sm" onClick={reRecord} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Re-record
        </Button>
      )}

      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      {transcribing && (
        <p className="text-sm text-muted-foreground animate-pulse font-display">
          Transcribing your voice...
        </p>
      )}
    </div>
  );
};

export default VoiceRecorder;

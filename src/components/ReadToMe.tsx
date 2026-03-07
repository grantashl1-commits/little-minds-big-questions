import { useState, useRef, useCallback } from "react";
import { Play, Pause, Moon, Sun, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type VoiceMode = "bedtime" | "daytime";

interface ReadToMeProps {
  storyText: string;
  title: string;
}

const ReadToMe = ({ storyText, title }: ReadToMeProps) => {
  const { user, isMember } = useAuth();
  const [mode, setMode] = useState<VoiceMode>("bedtime");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadedMode, setLoadedMode] = useState<VoiceMode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAudio = useCallback(async (selectedMode: VoiceMode) => {
    setLoading(true);
    try {
      const fullText = `${title}.\n\n${storyText}`;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/read-to-me`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: fullText, mode: selectedMode }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate audio");
      }

      const blob = await response.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setLoadedMode(selectedMode);

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (e: any) {
      toast.error(e.message || "Could not play story");
    } finally {
      setLoading(false);
    }
  }, [storyText, title, audioUrl]);

  const handlePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    if (audioUrl && loadedMode === mode) {
      await audioRef.current.play();
      setPlaying(true);
    } else {
      await generateAudio(mode);
    }
  }, [playing, audioUrl, loadedMode, mode, generateAudio]);

  const handleModeSwitch = (newMode: VoiceMode) => {
    if (newMode === mode) return;
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
    setMode(newMode);
  };

  // Locked state for non-members
  if (!user || !isMember) {
    return (
      <div className="bg-accent/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base">🎧 Read to Me</h3>
            <p className="text-xs text-muted-foreground">Listen to this story in a calm, child-friendly voice</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" disabled className="gap-2 opacity-60">
            <Lock className="w-4 h-4" />
            Unlock with Membership
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            {mode === "bedtime" ? <Moon className="w-5 h-5 text-accent-foreground" /> : <Sun className="w-5 h-5 text-accent-foreground" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-base">🎧 Read to Me</h3>
            <p className="text-xs text-muted-foreground">
              {mode === "bedtime" ? "Gentle bedtime voice" : "Bright daytime voice"}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-card rounded-full p-1 gap-1 storybook-shadow">
          <button
            onClick={() => handleModeSwitch("bedtime")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${
              mode === "bedtime" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-3 h-3" /> Bedtime
          </button>
          <button
            onClick={() => handleModeSwitch("daytime")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${
              mode === "daytime" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="w-3 h-3" /> Daytime
          </button>
        </div>
      </div>

      {/* Play button */}
      <Button
        onClick={handlePlay}
        disabled={loading}
        variant={mode === "bedtime" ? "secondary" : "default"}
        className="gap-2 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating voice...
          </>
        ) : playing ? (
          <>
            <Pause className="w-4 h-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-4 h-4 ml-0.5" />
            {audioUrl && loadedMode === mode ? "Resume" : "Play Story"}
          </>
        )}
      </Button>

      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default ReadToMe;

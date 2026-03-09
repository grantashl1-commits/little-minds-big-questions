import { useState, useRef, useCallback } from "react";
import { Play, Pause, Moon, Sun, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type VoiceMode = "bedtime" | "daytime";

interface ReadToMeProps {
  storyText: string;
  title: string;
  questionId?: string;
}

const ReadToMe = ({ storyText, title, questionId }: ReadToMeProps) => {
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
      const audio = audioRef.current;
      if (audio) {
        audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
        await audio.play().catch(() => {});
        audio.pause();
      }

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
          body: JSON.stringify({ text: fullText, mode: selectedMode, questionId }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate audio");
      }

      const contentType = response.headers.get("content-type") || "";

      // If cached URL returned as JSON
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.cachedUrl) {
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(data.cachedUrl);
          setLoadedMode(selectedMode);
          if (audio) {
            audio.src = data.cachedUrl;
            await audio.play();
            setPlaying(true);
          }
          return;
        }
      }

      // Raw audio blob
      const blob = await response.blob();
      if (audioUrl && audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setLoadedMode(selectedMode);

      if (audio) {
        audio.src = url;
        await audio.play();
        setPlaying(true);
      }
    } catch (e: any) {
      toast.error(e.message || "Could not play story");
    } finally {
      setLoading(false);
    }
  }, [storyText, title, audioUrl, questionId]);

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

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Could not start checkout");
    }
  };

  if (!user || !isMember) {
    return (
      <div className="bg-accent/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base">Read to Me</h3>
            <p className="text-xs text-muted-foreground">Listen to this story in a calm, child-friendly voice</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="default" onClick={handleUpgrade} className="gap-2">
            <Lock className="w-4 h-4" />
            {user ? "Upgrade to Unlock" : "Sign In to Unlock"}
          </Button>
        </div>
      </div>
    );
  }

  const isBedtime = mode === "bedtime";

  return (
    <div className={`rounded-2xl p-6 mb-8 transition-colors ${isBedtime ? "bg-[hsl(240_20%_18%)] text-[hsl(40_30%_90%)]" : "bg-accent/10"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBedtime ? "bg-[hsl(240_20%_25%)]" : "bg-accent/20"}`}>
            {isBedtime ? <Moon className="w-5 h-5 text-[hsl(40_30%_80%)]" /> : <Sun className="w-5 h-5 text-accent-foreground" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-base">{isBedtime ? "Bedtime Story" : "Read to Me"}</h3>
            <p className={`text-xs ${isBedtime ? "text-[hsl(40_30%_70%)]" : "text-muted-foreground"}`}>
              {isBedtime ? "Gentle, calming bedtime voice" : "Bright daytime voice"}
            </p>
          </div>
        </div>
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
      <Button
        onClick={handlePlay}
        disabled={loading}
        variant={mode === "bedtime" ? "secondary" : "default"}
        className="gap-2 w-full"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating voice...</>
        ) : playing ? (
          <><Pause className="w-4 h-4" /> Pause</>
        ) : (
          <><Play className="w-4 h-4 ml-0.5" /> {audioUrl && loadedMode === mode ? "Resume" : "Play Story"}</>
        )}
      </Button>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />
    </div>
  );
};

export default ReadToMe;

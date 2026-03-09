import { useState, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }, [playing]);

  return (
    <div className="flex items-center gap-3 bg-primary/10 rounded-xl px-4 py-3">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
      >
        {playing ? (
          <Pause className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </button>
      <div>
        <p className="font-display text-sm font-semibold">Asked in their own voice</p>
        <p className="text-xs text-muted-foreground">Tap to listen</p>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
};

export default AudioPlayer;

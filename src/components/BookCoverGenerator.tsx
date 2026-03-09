import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import boyImg from "@/assets/hero-illustration.png";
import girlImg from "@/assets/hero-girl-illustration.png";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

interface BookCoverGeneratorProps {
  defaultName?: string;
}

const BookCoverGenerator = ({ defaultName = "" }: BookCoverGeneratorProps) => {
  const [childName, setChildName] = useState(defaultName);
  const [character, setCharacter] = useState<"boy" | "girl">("boy");
  const [generating, setGenerating] = useState(false);

  const generateCover = useCallback(async () => {
    if (!childName.trim()) return;
    setGenerating(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;

      // Sage green background
      ctx.fillStyle = "#A8D5BA";
      ctx.fillRect(0, 0, 1080, 1080);

      // Decorative pastel circles
      const circles = [
        { x: 160, y: 180, r: 90, color: "#F4B8C1" },   // pink
        { x: 920, y: 220, r: 70, color: "#B9D9F3" },   // blue
        { x: 120, y: 820, r: 60, color: "#D4B8E8" },   // purple
        { x: 940, y: 780, r: 80, color: "#F9E6A0" },   // yellow
        { x: 540, y: 100, r: 50, color: "#BCCFA8" },   // green
        { x: 800, y: 950, r: 45, color: "#F4B8C1" },   // pink
      ];

      ctx.globalAlpha = 0.35;
      circles.forEach(({ x, y, r, color }) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // White card area
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      drawRoundedRect(ctx, 80, 80, 920, 920, 40);
      ctx.fill();

      // Child's name
      ctx.fillStyle = "#2D2A26";
      ctx.font = "bold 72px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${childName.trim().toUpperCase()}'S`, 540, 240);

      // Subtitle line 1
      ctx.font = "500 36px Fredoka, sans-serif";
      ctx.fillStyle = "#2D2A26";
      ctx.globalAlpha = 0.7;
      ctx.fillText("Answers to Life's", 540, 320);
      ctx.fillText("Big Questions", 540, 370);
      ctx.globalAlpha = 1;

      // Load and draw character illustration
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = character === "boy" ? boyImg : girlImg;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load illustration"));
      });

      // Draw character centered in lower portion
      const imgSize = 420;
      const imgX = (1080 - imgSize) / 2;
      const imgY = 420;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

      // Footer brand
      ctx.fillStyle = "#2D2A26";
      ctx.globalAlpha = 0.4;
      ctx.font = "500 22px Fredoka, Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌱 Little Minds Big Questions", 540, 960);
      ctx.globalAlpha = 1;

      // Download
      const link = document.createElement("a");
      link.download = `book-cover-${childName.trim().toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  }, [childName, character]);

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg">📖 Book Cover Page</h3>
      <p className="text-sm text-muted-foreground">
        Generate a personalised 1080×1080 book cover to use as the first page of your Canva book.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cover-name">Child's Name</Label>
          <Input
            id="cover-name"
            placeholder="e.g. Ruby"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Character</Label>
          <div className="flex gap-2">
            <Button
              variant={character === "boy" ? "default" : "outline"}
              size="sm"
              onClick={() => setCharacter("boy")}
              type="button"
            >
              👦 Boy
            </Button>
            <Button
              variant={character === "girl" ? "default" : "outline"}
              size="sm"
              onClick={() => setCharacter("girl")}
              type="button"
            >
              👧 Girl
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-border overflow-hidden bg-[hsl(var(--sage))] aspect-square max-w-xs mx-auto flex flex-col items-center justify-center p-6 text-center gap-2">
        <p className="font-display font-bold text-2xl text-foreground">
          {childName.trim() ? `${childName.trim().toUpperCase()}'S` : "NAME'S"}
        </p>
        <p className="text-sm text-foreground/70 font-display">
          Answers to Life's Big Questions
        </p>
        <img
          src={character === "boy" ? boyImg : girlImg}
          alt={`${character} illustration`}
          className="w-32 h-32 object-contain mt-2"
          style={{ mixBlendMode: "multiply" }}
        />
        <p className="text-xs text-foreground/40 mt-2">🌱 Little Minds Big Questions</p>
      </div>

      <Button
        variant="sage"
        size="lg"
        onClick={generateCover}
        disabled={!childName.trim() || generating}
        className="gap-2 w-full sm:w-auto"
      >
        <Download className="h-4 w-4" />
        {generating ? "Generating…" : "Download Book Cover"}
      </Button>
    </div>
  );
};

export default BookCoverGenerator;

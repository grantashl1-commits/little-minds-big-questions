import { useCallback } from "react";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { QuestionEntry } from "@/lib/constants";

interface StoryCardGeneratorProps {
  question: QuestionEntry;
}

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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 999
): number {
  const words = text.split(" ");
  let line = "";
  let lines = 0;

  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line) {
      if (lines >= maxLines - 1) {
        ctx.fillText(line.trim() + "...", x, y);
        return y + lineHeight;
      }
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

function createBaseCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;

  // Cream background
  ctx.fillStyle = "#F4E8D0";
  ctx.fillRect(0, 0, 1080, 1080);

  // Soft decorative circles
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#B9D9F3";
  ctx.beginPath(); ctx.arc(900, 150, 120, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#E9A8B5";
  ctx.beginPath(); ctx.arc(180, 900, 80, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#BCCFA8";
  ctx.beginPath(); ctx.arc(950, 850, 60, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  return { canvas, ctx };
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#2D2A26";
  ctx.globalAlpha = 0.4;
  ctx.font = "500 22px Fredoka, Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🌱 Little Minds Big Questions", 540, 1040);
  ctx.globalAlpha = 1;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

const StoryCardGenerator = ({ question }: StoryCardGeneratorProps) => {
  const { user, isMember } = useAuth();

  const handleUpgrade = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Could not start checkout");
    }
  };

  const generateQuestionCard = useCallback(() => {
    const { canvas, ctx } = createBaseCanvas();

    // Card background
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    drawRoundedRect(ctx, 60, 60, 960, 900, 40);
    ctx.fill();

    // Question mark icon
    ctx.fillStyle = "#B9D9F3";
    ctx.font = "bold 80px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💬", 540, 200);

    // Question text
    ctx.fillStyle = "#2D2A26";
    ctx.font = "bold 42px Fredoka, Nunito, sans-serif";
    ctx.textAlign = "center";
    wrapText(ctx, `"${question.question_text}"`, 540, 320, 800, 56, 5);

    // Child info
    ctx.fillStyle = "#2D2A26";
    ctx.globalAlpha = 0.6;
    ctx.font = "500 32px Nunito, sans-serif";
    ctx.fillText(`${question.child_name} — Age ${question.child_age}`, 540, 800);
    ctx.globalAlpha = 1;

    drawFooter(ctx);
    downloadCanvas(canvas, `question-card-${question.child_name.toLowerCase()}.png`);
  }, [question]);

  const generateStoryCard = useCallback(() => {
    const { canvas, ctx } = createBaseCanvas();

    // Title
    ctx.fillStyle = "#2D2A26";
    ctx.font = "bold 38px Fredoka, sans-serif";
    ctx.textAlign = "center";
    wrapText(ctx, question.metaphor_title, 540, 100, 860, 50, 2);

    // Divider
    ctx.strokeStyle = "#B9D9F3";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(340, 180);
    ctx.lineTo(740, 180);
    ctx.stroke();

    // Question
    ctx.fillStyle = "#2D2A26";
    ctx.globalAlpha = 0.5;
    ctx.font = "italic 26px Nunito, sans-serif";
    wrapText(ctx, `"${question.question_text}"`, 540, 230, 860, 36, 2);
    ctx.globalAlpha = 1;

    // Story text
    ctx.fillStyle = "#2D2A26";
    ctx.font = "400 28px Nunito, sans-serif";
    ctx.textAlign = "center";
    wrapText(ctx, question.metaphor_answer, 540, 340, 860, 40, 14);

    // Child info
    ctx.fillStyle = "#2D2A26";
    ctx.globalAlpha = 0.6;
    ctx.font = "500 28px Nunito, sans-serif";
    ctx.fillText(`${question.child_name} — Age ${question.child_age}`, 540, 960);
    ctx.globalAlpha = 1;

    drawFooter(ctx);
    downloadCanvas(canvas, `story-card-${question.child_name.toLowerCase()}.png`);
  }, [question]);

  const generateCarousel = useCallback(() => {
    const slides: { draw: (ctx: CanvasRenderingContext2D) => void; name: string }[] = [
      {
        name: "slide1",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 48px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("💬", 540, 300);
          wrapText(ctx, `"${question.question_text}"`, 540, 420, 800, 60, 5);
          ctx.globalAlpha = 0.5;
          ctx.font = "500 30px Nunito, sans-serif";
          ctx.fillText(`Asked by ${question.child_name}, age ${question.child_age}`, 540, 800);
          ctx.globalAlpha = 1;
        },
      },
      {
        name: "slide2",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 44px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(question.metaphor_title, 540, 200);

          ctx.strokeStyle = "#E9A8B5";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(340, 260); ctx.lineTo(740, 260); ctx.stroke();

          ctx.font = "400 30px Nunito, sans-serif";
          wrapText(ctx, question.metaphor_answer, 540, 340, 860, 42, 14);
        },
      },
      {
        name: "slide3",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 40px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("📖 The Story", 540, 200);

          ctx.font = "400 28px Nunito, sans-serif";
          wrapText(ctx, question.metaphor_answer, 540, 300, 860, 40, 16);
        },
      },
      {
        name: "slide4",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 40px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("👩‍👧 For Parents", 540, 200);

          ctx.font = "400 30px Nunito, sans-serif";
          wrapText(ctx, question.parent_explanation, 540, 320, 860, 44, 12);
        },
      },
    ];

    slides.forEach((slide) => {
      const { canvas, ctx } = createBaseCanvas();
      slide.draw(ctx);
      drawFooter(ctx);
      downloadCanvas(canvas, `${slide.name}-${question.child_name.toLowerCase()}.png`);
    });
  }, [question]);

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg">📥 Download & Share</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="peach" size="sm" onClick={generateQuestionCard} className="gap-2">
          <Download className="w-4 h-4" />
          Question Card
        </Button>
        <Button variant="sage" size="sm" onClick={generateStoryCard} className="gap-2">
          <Download className="w-4 h-4" />
          Story Card
        </Button>
        <Button variant="accent" size="sm" onClick={generateCarousel} className="gap-2">
          <Download className="w-4 h-4" />
          Instagram Carousel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        All cards are 1080×1080px — perfect for Instagram, scrapbooks, or memory journals.
      </p>
    </div>
  );
};

export default StoryCardGenerator;

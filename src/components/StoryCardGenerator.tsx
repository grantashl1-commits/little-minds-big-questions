import { useCallback, useMemo, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
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

const palette = {
  background: "hsl(34 58% 89%)",
  paper: "hsl(36 50% 95%)",
  paperSoft: "hsl(36 40% 92%)",
  ink: "hsl(30 7% 15%)",
  muted: "hsl(30 7% 35%)",
  border: "hsl(34 30% 80%)",
  blue: "hsl(210 76% 84%)",
  coral: "hsl(14 76% 65%)",
  coralSoft: "hsl(14 76% 92%)",
  sage: "hsl(88 30% 74%)",
  sageSoft: "hsl(88 30% 92%)",
  gold: "hsl(42 84% 68%)",
};

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

function wrapParagraphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const paragraphs = text.split(/\n+/).filter(Boolean);
  let currentY = y;
  let linesUsed = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line) {
        if (linesUsed >= maxLines - 1) {
          ctx.fillText(line.trim() + "…", x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = word + " ";
        currentY += lineHeight;
        linesUsed++;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (linesUsed >= maxLines - 1) {
        ctx.fillText(line.trim() + "…", x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      currentY += lineHeight;
      linesUsed++;
    }

    currentY += lineHeight * 0.35;
  }

  return currentY;
}

function createBaseCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;

   const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
   gradient.addColorStop(0, palette.background);
   gradient.addColorStop(1, palette.paper);
   ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

   // Soft decorative circles
  ctx.globalAlpha = 0.15;
   ctx.fillStyle = palette.blue;
  ctx.beginPath(); ctx.arc(900, 150, 120, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = palette.coral;
  ctx.beginPath(); ctx.arc(180, 900, 80, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = palette.sage;
  ctx.beginPath(); ctx.arc(950, 850, 60, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  return { canvas, ctx };
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = palette.ink;
  ctx.globalAlpha = 0.4;
  ctx.font = "500 22px Fredoka, Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Little Minds Big Questions", 540, 1040);
  ctx.globalAlpha = 1;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function loadImage(src?: string | null) {
  if (!src) return null;

  return await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / img.width, height / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

const StoryCardGenerator = ({ question }: StoryCardGeneratorProps) => {
  const { user, isMember } = useAuth();
  const [downloading, setDownloading] = useState<"question" | "story" | "carousel" | null>(null);

  const excerpt = useMemo(() => {
    const firstParagraph = question.metaphor_answer.split(/\n+/)[0] || question.metaphor_answer;
    return firstParagraph.length > 190 ? `${firstParagraph.slice(0, 187)}…` : firstParagraph;
  }, [question.metaphor_answer]);

  const parentSnippet = useMemo(() => {
    return question.parent_explanation.length > 140
      ? `${question.parent_explanation.slice(0, 137)}…`
      : question.parent_explanation;
  }, [question.parent_explanation]);

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

  const generateQuestionCard = useCallback(async () => {
    setDownloading("question");
    const { canvas, ctx } = createBaseCanvas();
    const image = await loadImage(question.image_url);

    ctx.fillStyle = palette.paper;
    drawRoundedRect(ctx, 54, 54, 972, 972, 44);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = palette.coralSoft;
    drawRoundedRect(ctx, 86, 86, 220, 52, 26);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 24px Fredoka, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("QUESTION CARD", 116, 120);

    ctx.fillStyle = palette.paperSoft;
    drawRoundedRect(ctx, 86, 168, 908, 430, 40);
    ctx.fill();

    if (image) {
      drawImageContain(ctx, image, 126, 194, 828, 378);
    }

    ctx.fillStyle = palette.blue;
    drawRoundedRect(ctx, 86, 640, 280, 52, 26);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.font = "600 24px Nunito, sans-serif";
    ctx.fillText(`${question.child_name}, age ${question.child_age}`, 116, 674);

    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 42px Fredoka, Nunito, sans-serif";
    wrapText(ctx, `“${question.question_text}”`, 540, 760, 820, 54, 4);

    ctx.fillStyle = palette.muted;
    ctx.font = "500 28px Nunito, sans-serif";
    wrapText(ctx, excerpt, 540, 934, 820, 38, 3);
    ctx.globalAlpha = 1;

    drawFooter(ctx);
    downloadCanvas(canvas, `question-card-${question.child_name.toLowerCase()}.png`);
    setDownloading(null);
  }, [question]);

  const generateStoryCard = useCallback(async () => {
    setDownloading("story");
    const { canvas, ctx } = createBaseCanvas();
    const image = await loadImage(question.image_url);

    ctx.fillStyle = palette.paper;
    drawRoundedRect(ctx, 54, 54, 972, 972, 44);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = palette.sageSoft;
    drawRoundedRect(ctx, 86, 86, 908, 420, 40);
    ctx.fill();

    if (image) {
      drawImageContain(ctx, image, 116, 116, 848, 360);
    }

    ctx.fillStyle = palette.sage;
    drawRoundedRect(ctx, 86, 540, 260, 50, 25);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "left";
    ctx.font = "bold 22px Fredoka, sans-serif";
    ctx.fillText("STORY CARD", 118, 572);

    ctx.textAlign = "center";
    ctx.font = "bold 40px Fredoka, sans-serif";
    wrapText(ctx, question.metaphor_title, 540, 658, 810, 48, 3);

    ctx.fillStyle = palette.muted;
    ctx.font = "italic 24px Nunito, sans-serif";
    wrapText(ctx, `“${question.question_text}”`, 540, 760, 800, 34, 2);

    ctx.fillStyle = palette.ink;
    ctx.font = "400 28px Nunito, sans-serif";
    wrapParagraphs(ctx, question.metaphor_answer, 120, 842, 840, 36, 5);

    ctx.fillStyle = palette.coralSoft;
    drawRoundedRect(ctx, 86, 940, 350, 52, 26);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.font = "600 22px Nunito, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${question.child_name}, age ${question.child_age}`, 118, 974);

    drawFooter(ctx);
    downloadCanvas(canvas, `story-card-${question.child_name.toLowerCase()}.png`);
    setDownloading(null);
  }, [question]);

  const generateCarousel = useCallback(async () => {
    setDownloading("carousel");
    const image = await loadImage(question.image_url);

    const slides: { draw: (ctx: CanvasRenderingContext2D) => void; name: string }[] = [
      {
        name: "slide1",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 42);
          ctx.fill();
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = palette.coralSoft;
          drawRoundedRect(ctx, 92, 92, 220, 50, 24);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 22px Fredoka, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("SLIDE 1 · THE QUESTION", 120, 124);

          ctx.fillStyle = palette.paperSoft;
          drawRoundedRect(ctx, 92, 176, 896, 420, 36);
          ctx.fill();
          if (image) {
            drawImageContain(ctx, image, 122, 206, 836, 360);
          }

          ctx.fillStyle = palette.ink;
          ctx.font = "bold 46px Fredoka, sans-serif";
          ctx.textAlign = "center";
          wrapText(ctx, `“${question.question_text}”`, 540, 720, 820, 56, 4);
          ctx.fillStyle = palette.muted;
          ctx.font = "500 28px Nunito, sans-serif";
          ctx.fillText(`Asked by ${question.child_name}, age ${question.child_age}`, 540, 924);
        },
      },
      {
        name: "slide2",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 42);
          ctx.fill();
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = palette.sageSoft;
          drawRoundedRect(ctx, 92, 92, 896, 320, 34);
          ctx.fill();
          if (image) {
            drawImageContain(ctx, image, 124, 118, 832, 268);
          }

          ctx.fillStyle = palette.sage;
          drawRoundedRect(ctx, 92, 448, 250, 50, 24);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.textAlign = "left";
          ctx.font = "bold 22px Fredoka, sans-serif";
          ctx.fillText("SLIDE 2 · THE STORY", 120, 480);

          ctx.textAlign = "center";
          ctx.font = "bold 40px Fredoka, sans-serif";
          wrapText(ctx, question.metaphor_title, 540, 580, 800, 48, 3);
          ctx.font = "400 28px Nunito, sans-serif";
          ctx.fillStyle = palette.ink;
          wrapParagraphs(ctx, question.metaphor_answer, 118, 704, 844, 38, 7);
        },
      },
      {
        name: "slide3",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 42);
          ctx.fill();
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = palette.blue;
          drawRoundedRect(ctx, 92, 92, 270, 50, 24);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.textAlign = "left";
          ctx.font = "bold 22px Fredoka, sans-serif";
          ctx.fillText("SLIDE 3 · FOR PARENTS", 120, 124);

          ctx.fillStyle = palette.ink;
          ctx.textAlign = "center";
          ctx.font = "bold 44px Fredoka, sans-serif";
          ctx.fillText("Why this story helps", 540, 240);

          ctx.fillStyle = palette.paperSoft;
          drawRoundedRect(ctx, 92, 292, 896, 310, 32);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.textAlign = "left";
          ctx.font = "400 32px Nunito, sans-serif";
          wrapParagraphs(ctx, question.parent_explanation, 132, 360, 820, 42, 5);

          ctx.fillStyle = palette.coralSoft;
          drawRoundedRect(ctx, 92, 650, 896, 180, 32);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 30px Fredoka, sans-serif";
          ctx.fillText("Better than a screenshot", 132, 712);
          ctx.font = "400 26px Nunito, sans-serif";
          wrapParagraphs(ctx, "Designed with image-first layout, readable story pacing, and a clean branded finish so every post feels intentional.", 132, 760, 820, 34, 4);
        },
      },
      {
        name: "slide4",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 42);
          ctx.fill();
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 3;
          ctx.stroke();

          if (image) {
            ctx.globalAlpha = 0.16;
            drawImageContain(ctx, image, 180, 120, 720, 420);
            ctx.globalAlpha = 1;
          }

          ctx.fillStyle = palette.ink;
          ctx.textAlign = "center";
          ctx.font = "bold 58px Fredoka, sans-serif";
          ctx.fillText("Ask a big question", 540, 620);
          ctx.fillText("and share it beautifully.", 540, 690);

          ctx.fillStyle = palette.gold;
          drawRoundedRect(ctx, 278, 770, 524, 90, 45);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 30px Fredoka, sans-serif";
          ctx.fillText("littlemindsbigquestions.com", 540, 827);

          ctx.fillStyle = palette.muted;
          ctx.font = "500 24px Nunito, sans-serif";
          ctx.fillText("Ready-made posts, keepsake cards, and swipeable story slides.", 540, 916);
        },
      },
    ];

    slides.forEach((slide) => {
      const { canvas, ctx } = createBaseCanvas();
      slide.draw(ctx);
      drawFooter(ctx);
      downloadCanvas(canvas, `${slide.name}-${question.child_name.toLowerCase()}.png`);
    });
    setDownloading(null);
  }, [question]);

  const previewCards = [
    {
      key: "question" as const,
      title: "Question Card",
      description: "A polished teaser poster with the question, artwork, and story hook.",
      accent: "bg-peach/15 border-peach/40",
      cta: isMember ? "Download question card" : "Download question card",
      action: generateQuestionCard,
    },
    {
      key: "story" as const,
      title: "Story Card",
      description: "A keepsake story poster with the title, artwork, and a curated excerpt.",
      accent: "bg-sage/15 border-sage/40",
      cta: isMember ? "Download story card" : "Unlock story card",
      action: isMember ? generateStoryCard : handleUpgrade,
    },
    {
      key: "carousel" as const,
      title: "Instagram Carousel",
      description: "A 4-slide share sequence built for swiping, storytelling, and saves.",
      accent: "bg-accent/15 border-accent/40",
      cta: isMember ? "Download carousel" : "Unlock carousel",
      action: isMember ? generateCarousel : handleUpgrade,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-lg">Download & Share</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          These are designed to beat a screenshot: cleaner pacing, bigger artwork, and layouts made for sharing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {previewCards.map((card) => (
          <div key={card.key} className={`rounded-3xl border p-4 storybook-shadow ${card.accent}`}>
            <div className="rounded-[1.75rem] border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/80">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                <div className="flex min-h-[260px] flex-col justify-between p-4">
                  <div>
                    <p className="text-[10px] font-display uppercase tracking-[0.24em] text-muted-foreground">{card.key === "carousel" ? "Swipe story sequence" : card.key === "story" ? "Keepsake share card" : "Question-led teaser"}</p>
                    <p className="mt-3 font-display text-lg font-bold leading-tight">“{question.question_text}”</p>
                    <p className="mt-1 text-xs text-muted-foreground">{question.child_name}, age {question.child_age}</p>
                  </div>

                  <div className="my-5 flex justify-center">
                    {question.image_url ? (
                      <img src={question.image_url} alt={question.metaphor_title} className={`object-contain ${card.key === "carousel" ? "h-32 w-32" : "h-28 w-28"}`} />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-primary/20" />
                    )}
                  </div>

                  <div>
                    <p className="font-display text-sm font-semibold">{card.key === "story" ? question.metaphor_title : card.key === "carousel" ? "Built as a 4-slide swipe-through" : "A soft hook into the full story"}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {card.key === "story" ? excerpt : card.key === "carousel" ? parentSnippet : excerpt}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant={card.key === "question" ? "peach" : card.key === "story" ? "sage" : "accent"}
                size="sm"
                onClick={card.action}
                disabled={downloading !== null}
                className="mt-4 w-full gap-2"
              >
                {downloading === card.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading === card.key ? "Preparing download..." : card.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        All downloads are 1080×1080px. Members get the keepsake story card and full Instagram carousel export.
      </p>
    </div>
  );
};

export default StoryCardGenerator;

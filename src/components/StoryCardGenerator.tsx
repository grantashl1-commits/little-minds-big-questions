import { useCallback, useMemo, useState } from "react";
import { Download, Loader2, Sparkles, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { QuestionEntry } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

// Richer palette with slide-specific tones
const palette = {
  cream: "hsl(34 58% 89%)",
  paper: "hsl(36 50% 95%)",
  paperSoft: "hsl(36 40% 92%)",
  ink: "hsl(30 7% 15%)",
  muted: "hsl(30 7% 40%)",
  border: "hsl(34 30% 80%)",
  blue: "hsl(210 76% 84%)",
  blueSoft: "hsl(210 60% 94%)",
  coral: "hsl(14 76% 65%)",
  coralSoft: "hsl(14 76% 92%)",
  sage: "hsl(88 30% 74%)",
  sageSoft: "hsl(88 30% 92%)",
  gold: "hsl(42 84% 68%)",
  goldSoft: "hsl(42 60% 92%)",
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
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
        ctx.fillText(line.trim() + "…", x, y);
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
  text: string, x: number, y: number,
  maxWidth: number, lineHeight: number, maxLines: number,
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

function createSlideCanvas(bg: string): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);
  return { canvas, ctx };
}

function drawDecorCircles(ctx: CanvasRenderingContext2D, variant: number) {
  ctx.globalAlpha = 0.12;
  const configs = [
    [{ c: palette.blue, x: 920, y: 140, r: 110 }, { c: palette.coral, x: 160, y: 920, r: 70 }, { c: palette.sage, x: 960, y: 880, r: 50 }],
    [{ c: palette.sage, x: 100, y: 160, r: 100 }, { c: palette.gold, x: 940, y: 900, r: 80 }, { c: palette.blue, x: 900, y: 200, r: 60 }],
    [{ c: palette.coral, x: 920, y: 160, r: 90 }, { c: palette.sage, x: 140, y: 880, r: 110 }, { c: palette.gold, x: 500, y: 100, r: 50 }],
    [{ c: palette.gold, x: 160, y: 140, r: 100 }, { c: palette.blue, x: 920, y: 920, r: 80 }, { c: palette.coral, x: 100, y: 800, r: 60 }],
    [{ c: palette.blue, x: 540, y: 100, r: 80 }, { c: palette.sage, x: 140, y: 900, r: 70 }, { c: palette.coral, x: 940, y: 880, r: 90 }],
  ];
  const circles = configs[variant % configs.length];
  for (const { c, x, y, r } of circles) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBrandFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = palette.ink;
  ctx.globalAlpha = 0.35;
  ctx.font = "500 20px Fredoka, Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Little Minds Big Questions", 540, 1050);
  ctx.globalAlpha = 1;
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(960, y);
  ctx.stroke();
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
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, y: number, width: number, height: number,
) {
  const scale = Math.min(width / img.width, height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

const StoryCardGenerator = ({ question }: StoryCardGeneratorProps) => {
  const { user, isMember } = useAuth();
  const [downloading, setDownloading] = useState<"question" | "story" | "carousel" | null>(null);
  const [previewType, setPreviewType] = useState<"story" | "carousel" | null>(null);

  const excerpt = useMemo(() => {
    const first = question.metaphor_answer.split(/\n+/)[0] || question.metaphor_answer;
    return first.length > 190 ? `${first.slice(0, 187)}…` : first;
  }, [question.metaphor_answer]);

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

  // ─── QUESTION CARD (free) ───
  const generateQuestionCard = useCallback(async () => {
    setDownloading("question");
    const { canvas, ctx } = createSlideCanvas(palette.cream);
    drawDecorCircles(ctx, 0);
    const image = await loadImage(question.image_url);

    // Card panel
    ctx.fillStyle = palette.paper;
    drawRoundedRect(ctx, 54, 54, 972, 972, 44);
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Image area
    if (image) {
      drawImageContain(ctx, image, 140, 100, 800, 440);
    }

    drawDivider(ctx, 570, palette.coral);

    // Badge
    ctx.fillStyle = palette.coralSoft;
    drawRoundedRect(ctx, 100, 596, 260, 48, 24);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "left";
    ctx.font = "600 22px Nunito, sans-serif";
    ctx.fillText(`${question.child_name}, age ${question.child_age}`, 126, 628);

    // Question
    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 44px Fredoka, sans-serif";
    wrapText(ctx, `"${question.question_text}"`, 540, 730, 820, 56, 4);

    // Excerpt
    ctx.fillStyle = palette.muted;
    ctx.font = "italic 26px Nunito, sans-serif";
    wrapText(ctx, excerpt, 540, 940, 820, 36, 2);

    drawBrandFooter(ctx);
    downloadCanvas(canvas, `question-card-${question.child_name.toLowerCase()}.png`);
    setDownloading(null);
  }, [question, excerpt]);

  // ─── STORY CARD (paid) ───
  const generateStoryCard = useCallback(async () => {
    setDownloading("story");
    const { canvas, ctx } = createSlideCanvas(palette.sageSoft);
    drawDecorCircles(ctx, 1);
    const image = await loadImage(question.image_url);

    // Full-width illustration hero
    ctx.fillStyle = palette.paper;
    drawRoundedRect(ctx, 54, 54, 972, 972, 44);
    ctx.fill();

    if (image) {
      ctx.save();
      drawRoundedRect(ctx, 80, 80, 920, 480, 36);
      ctx.clip();
      ctx.fillStyle = palette.sageSoft;
      ctx.fillRect(80, 80, 920, 480);
      drawImageContain(ctx, image, 80, 80, 920, 480);
      ctx.restore();
    }

    // Decorative flourish line
    ctx.strokeStyle = palette.sage;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(340, 590);
    ctx.bezierCurveTo(440, 575, 640, 575, 740, 590);
    ctx.stroke();

    // Story title
    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = "bold 42px Fredoka, sans-serif";
    wrapText(ctx, question.metaphor_title, 540, 650, 800, 50, 2);

    // Question as pull-quote
    ctx.fillStyle = palette.muted;
    ctx.font = "italic 26px Nunito, sans-serif";
    wrapText(ctx, `"${question.question_text}"`, 540, 748, 780, 34, 2);

    // Story excerpt
    ctx.textAlign = "left";
    ctx.fillStyle = palette.ink;
    ctx.font = "400 26px Nunito, sans-serif";
    wrapParagraphs(ctx, question.metaphor_answer, 120, 840, 840, 34, 4);

    // Child name badge
    ctx.fillStyle = palette.coralSoft;
    drawRoundedRect(ctx, 100, 970, 300, 44, 22);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.font = "600 20px Nunito, sans-serif";
    ctx.fillText(`A story for ${question.child_name}, age ${question.child_age}`, 120, 998);

    drawBrandFooter(ctx);
    downloadCanvas(canvas, `story-card-${question.child_name.toLowerCase()}.png`);
    setDownloading(null);
  }, [question]);

  // ─── INSTAGRAM CAROUSEL (paid, 5 slides) ───
  const generateCarousel = useCallback(async () => {
    setDownloading("carousel");
    const image = await loadImage(question.image_url);
    const paragraphs = question.metaphor_answer.split(/\n+/).filter(Boolean);
    const storyPart1 = paragraphs.slice(0, Math.ceil(paragraphs.length / 2)).join("\n\n");
    const storyPart2 = paragraphs.slice(Math.ceil(paragraphs.length / 2)).join("\n\n");

    const slides: { bg: string; variant: number; draw: (ctx: CanvasRenderingContext2D) => void; name: string }[] = [
      // SLIDE 1: Magazine cover — full-bleed image + question overlay
      {
        bg: palette.cream, variant: 0, name: "slide1-cover",
        draw: (ctx) => {
          if (image) {
            ctx.globalAlpha = 0.2;
            drawImageContain(ctx, image, 0, 0, 1080, 1080);
            ctx.globalAlpha = 1;
            // Hero image centered
            drawImageContain(ctx, image, 140, 60, 800, 540);
          }

          // Bottom panel
          ctx.fillStyle = palette.paper;
          ctx.globalAlpha = 0.92;
          drawRoundedRect(ctx, 0, 620, 1080, 460, 0);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Tag
          ctx.fillStyle = palette.coral;
          drawRoundedRect(ctx, 100, 660, 200, 44, 22);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 20px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("BIG QUESTION", 200, 688);

          // Question
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 48px Fredoka, sans-serif";
          ctx.textAlign = "left";
          wrapText(ctx, `"${question.question_text}"`, 100, 760, 880, 58, 4);

          // Name
          ctx.fillStyle = palette.muted;
          ctx.font = "500 26px Nunito, sans-serif";
          ctx.fillText(`Asked by ${question.child_name}, age ${question.child_age}`, 100, 990);
        },
      },
      // SLIDE 2: Story title page — elegant opening
      {
        bg: palette.paper, variant: 1, name: "slide2-title",
        draw: (ctx) => {
          // Decorative frame
          ctx.strokeStyle = palette.sage;
          ctx.lineWidth = 3;
          drawRoundedRect(ctx, 60, 60, 960, 960, 40);
          ctx.stroke();

          // Small illustration
          if (image) {
            drawImageContain(ctx, image, 340, 100, 400, 320);
          }

          // Flourish
          ctx.strokeStyle = palette.gold;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(280, 460);
          ctx.bezierCurveTo(400, 440, 680, 440, 800, 460);
          ctx.stroke();

          // Title
          ctx.textAlign = "center";
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 52px Fredoka, sans-serif";
          wrapText(ctx, question.metaphor_title, 540, 540, 800, 62, 3);

          // Opening paragraph
          ctx.fillStyle = palette.muted;
          ctx.font = "italic 28px Nunito, sans-serif";
          wrapText(ctx, `"${question.question_text}"`, 540, 720, 780, 38, 2);

          drawDivider(ctx, 810, palette.sage);

          ctx.fillStyle = palette.ink;
          ctx.textAlign = "left";
          ctx.font = "400 26px Nunito, sans-serif";
          wrapParagraphs(ctx, storyPart1, 120, 850, 840, 34, 5);
        },
      },
      // SLIDE 3: Story continuation — different background
      {
        bg: palette.blueSoft, variant: 2, name: "slide3-story",
        draw: (ctx) => {
          // Inner card
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 40);
          ctx.fill();

          // Label
          ctx.fillStyle = palette.blue;
          drawRoundedRect(ctx, 100, 90, 220, 44, 22);
          ctx.fill();
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 20px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("THE STORY", 210, 118);

          // Story continuation
          ctx.textAlign = "left";
          ctx.fillStyle = palette.ink;
          ctx.font = "400 28px Nunito, sans-serif";
          wrapParagraphs(ctx, storyPart2 || storyPart1, 120, 200, 840, 38, 18);

          // Pull quote at bottom
          if (image) {
            ctx.globalAlpha = 0.15;
            drawImageContain(ctx, image, 700, 780, 280, 220);
            ctx.globalAlpha = 1;
          }
        },
      },
      // SLIDE 4: For Parents — insight card
      {
        bg: palette.coralSoft, variant: 3, name: "slide4-parents",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 40);
          ctx.fill();

          // Header
          ctx.fillStyle = palette.coral;
          drawRoundedRect(ctx, 100, 100, 260, 48, 24);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 22px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("FOR PARENTS", 230, 130);

          ctx.textAlign = "center";
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 44px Fredoka, sans-serif";
          ctx.fillText("Why this story helps", 540, 230);

          drawDivider(ctx, 270, palette.coral);

          // Parent explanation
          ctx.textAlign = "left";
          ctx.fillStyle = palette.ink;
          ctx.font = "400 30px Nunito, sans-serif";
          wrapParagraphs(ctx, question.parent_explanation, 120, 330, 840, 40, 12);

          // Small image
          if (image) {
            ctx.globalAlpha = 0.2;
            drawImageContain(ctx, image, 380, 820, 320, 200);
            ctx.globalAlpha = 1;
          }
        },
      },
      // SLIDE 5: CTA — branding + call to action
      {
        bg: palette.goldSoft, variant: 4, name: "slide5-cta",
        draw: (ctx) => {
          ctx.fillStyle = palette.paper;
          drawRoundedRect(ctx, 60, 60, 960, 960, 40);
          ctx.fill();

          if (image) {
            ctx.globalAlpha = 0.14;
            drawImageContain(ctx, image, 180, 80, 720, 460);
            ctx.globalAlpha = 1;
          }

          ctx.textAlign = "center";
          ctx.fillStyle = palette.ink;
          ctx.font = "bold 56px Fredoka, sans-serif";
          ctx.fillText("Every big question", 540, 580);
          ctx.fillText("deserves a gentle story.", 540, 650);

          // CTA button
          ctx.fillStyle = palette.coral;
          drawRoundedRect(ctx, 260, 730, 560, 90, 45);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 30px Fredoka, sans-serif";
          ctx.fillText("littlemindsbigquestions.com", 540, 785);

          ctx.fillStyle = palette.muted;
          ctx.font = "500 24px Nunito, sans-serif";
          ctx.fillText("Bedtime stories that answer life's biggest little questions.", 540, 890);

          // Decorative dots
          ctx.fillStyle = palette.gold;
          ctx.globalAlpha = 0.3;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(380 + i * 75, 950, 6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        },
      },
    ];

    for (const slide of slides) {
      const { canvas, ctx } = createSlideCanvas(slide.bg);
      drawDecorCircles(ctx, slide.variant);
      slide.draw(ctx);
      drawBrandFooter(ctx);
      downloadCanvas(canvas, `${slide.name}-${question.child_name.toLowerCase()}.png`);
    }
    setDownloading(null);
  }, [question]);

  const previewCards = [
    {
      key: "question" as const,
      title: "Question Card",
      description: "A polished teaser poster with the question, artwork, and story hook.",
      accent: "bg-peach/15 border-peach/40",
      cta: "Download question card",
      action: generateQuestionCard,
      free: true,
    },
    {
      key: "story" as const,
      title: "Story Card",
      description: "A keepsake poster with full-bleed artwork, story title, and curated excerpt.",
      accent: "bg-sage/15 border-sage/40",
      cta: isMember ? "Download story card" : "Unlock story card",
      action: isMember ? generateStoryCard : handleUpgrade,
      free: false,
    },
    {
      key: "carousel" as const,
      title: "Instagram Carousel",
      description: "A 5-slide editorial sequence — cover, story pages, parent insight, and CTA.",
      accent: "bg-accent/15 border-accent/40",
      cta: isMember ? "Download 5 slides" : "Unlock carousel",
      action: isMember ? generateCarousel : handleUpgrade,
      free: false,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-lg">Download & Share</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Editorial-quality posts designed to look better than a screenshot — with artwork, story pacing, and branded layouts.
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
                  {card.free || isMember ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                <div className="flex min-h-[260px] flex-col justify-between p-4">
                  <div>
                    <p className="text-[10px] font-display uppercase tracking-[0.24em] text-muted-foreground">
                      {card.key === "carousel" ? "5-slide editorial sequence" : card.key === "story" ? "Full-bleed keepsake card" : "Question-led teaser"}
                    </p>
                    <p className="mt-3 font-display text-lg font-bold leading-tight">"{question.question_text}"</p>
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
                    <p className="font-display text-sm font-semibold">
                      {card.key === "story" ? question.metaphor_title : card.key === "carousel" ? "Cover → Story → Parents → CTA" : "A soft hook into the full story"}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {card.key === "carousel"
                        ? "Each slide has a unique layout, colour palette, and editorial treatment."
                        : excerpt}
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
                {downloading === card.key ? "Preparing download…" : card.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        All downloads are 1080×1080px. Members get the keepsake story card and full 5-slide Instagram carousel.
      </p>
    </div>
  );
};

export default StoryCardGenerator;

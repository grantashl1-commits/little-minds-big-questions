import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Share2, BookOpen, Headphones, Download } from "lucide-react";
import { toast } from "sonner";
import ReadToMe from "@/components/ReadToMe";

interface WeeklyQ {
  id: string;
  question: string;
  story: string;
  story_title: string | null;
  image_url: string | null;
  week_start: string;
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
  x: number, y: number,
  maxWidth: number, lineHeight: number,
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

function createBaseCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#F4E8D0";
  ctx.fillRect(0, 0, 1080, 1080);
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

const WeeklyQuestion = () => {
  const [wq, setWq] = useState<WeeklyQ | null>(null);
  const [showFullStory, setShowFullStory] = useState(false);
  const [showListen, setShowListen] = useState(false);

  useEffect(() => {
    supabase
      .from("weekly_questions")
      .select("*")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setWq(data as WeeklyQ);
      });
  }, []);

  const handleShare = async () => {
    if (!wq) return;
    const shareData = {
      title: `Question of the Week: ${wq.question}`,
      text: `"${wq.question}"\n\n${wq.story_title || ""}\n\nFrom Little Minds BIG Questions`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      toast.success("Copied to clipboard!");
    }
  };

  const generateCarousel = useCallback(() => {
    if (!wq) return;

    const slides: { draw: (ctx: CanvasRenderingContext2D) => void; name: string }[] = [
      {
        name: "slide1-question",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 36px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✨ Question of the Week", 540, 250);
          ctx.font = "bold 48px Fredoka, sans-serif";
          wrapText(ctx, `"${wq.question}"`, 540, 420, 800, 62, 5);
          ctx.globalAlpha = 0.5;
          ctx.font = "500 28px Nunito, sans-serif";
          ctx.fillText("Little Minds BIG Questions", 540, 850);
          ctx.globalAlpha = 1;
        },
      },
      {
        name: "slide2-illustration",
        draw: (ctx) => {
          // Illustration slide - centered text since we can't draw images in canvas from URL synchronously
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 44px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(wq.story_title || "The Story", 540, 300);
          ctx.strokeStyle = "#BCCFA8";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(340, 370); ctx.lineTo(740, 370); ctx.stroke();
          ctx.font = "400 30px Nunito, sans-serif";
          ctx.fillStyle = "#2D2A26";
          ctx.globalAlpha = 0.7;
          ctx.fillText("🎨", 540, 550);
          ctx.font = "italic 26px Nunito, sans-serif";
          ctx.fillText("See the full illustration at", 540, 650);
          ctx.font = "500 26px Nunito, sans-serif";
          ctx.fillText("littlemindsbigquestions.com", 540, 700);
          ctx.globalAlpha = 1;
        },
      },
      {
        name: "slide3-story",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 40px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("📖 The Story", 540, 150);
          ctx.font = "400 28px Nunito, sans-serif";
          const excerpt = wq.story.length > 500 ? wq.story.slice(0, 500) + "…" : wq.story;
          wrapText(ctx, excerpt, 540, 260, 860, 40, 16);
        },
      },
      {
        name: "slide4-cta",
        draw: (ctx) => {
          ctx.fillStyle = "#2D2A26";
          ctx.font = "bold 44px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🌙", 540, 280);
          ctx.fillText("Ask your child", 540, 400);
          ctx.fillText("a question tonight.", 540, 460);

          ctx.fillStyle = "#7C9E8A";
          drawRoundedRect(ctx, 290, 540, 500, 80, 40);
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 30px Fredoka, sans-serif";
          ctx.fillText("Try it free →", 540, 592);

          ctx.fillStyle = "#2D2A26";
          ctx.globalAlpha = 0.5;
          ctx.font = "500 24px Nunito, sans-serif";
          ctx.fillText("littlemindsbigquestions.com", 540, 780);
          ctx.globalAlpha = 1;
        },
      },
    ];

    slides.forEach((slide) => {
      const { canvas, ctx } = createBaseCanvas();
      slide.draw(ctx);
      drawFooter(ctx);
      const link = document.createElement("a");
      link.download = `weekly-${slide.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    toast.success("4 carousel slides downloaded!");
  }, [wq]);

  if (!wq) return null;

  const previewText = wq.story.length > 300 ? wq.story.slice(0, 300) + "…" : wq.story;

  return (
    <section className="py-16 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-accent/20 text-accent-foreground text-xs font-display font-semibold rounded-full px-4 py-1.5 mb-3">
            Question of the Week
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            "{wq.question}"
          </h2>
        </div>

        <div className="bg-card rounded-2xl p-8 storybook-shadow">
          {wq.image_url && (
            <div className="flex justify-center mb-6">
              <img
                src={wq.image_url}
                alt={wq.story_title || "Story illustration"}
                className="w-48 h-48 object-contain rounded-xl"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
          )}

          {wq.story_title && (
            <h3 className="font-display text-xl font-bold text-center mb-4">{wq.story_title}</h3>
          )}

          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line mb-4">
            {showFullStory ? wq.story : previewText}
          </p>

          {wq.story.length > 300 && (
            <button
              onClick={() => setShowFullStory(!showFullStory)}
              className="text-xs font-display text-primary underline underline-offset-4 hover:text-primary/80 transition-colors mb-6 block mx-auto"
            >
              {showFullStory ? "Show less" : "Read the full story"}
            </button>
          )}

          {/* Listen section */}
          {showListen && (
            <div className="mb-6 border-t border-border pt-6">
              <ReadToMe
                storyText={wq.story}
                title={wq.story_title || wq.question}
                questionId={wq.id}
              />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="sage"
              onClick={() => setShowListen(!showListen)}
              className="gap-2"
            >
              <Headphones className="w-4 h-4" />
              {showListen ? "Hide Player" : "Listen"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFullStory(true)}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Read
            </Button>

            <Button variant="accent" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>

            <Button variant="peach" onClick={generateCarousel} className="gap-2">
              <Download className="w-4 h-4" />
              Instagram Carousel
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyQuestion;

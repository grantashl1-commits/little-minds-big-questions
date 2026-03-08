import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface WeeklyQ {
  id: string;
  question: string;
  story: string;
  story_title: string | null;
  image_url: string | null;
  week_start: string;
}

const WeeklyQuestion = () => {
  const [wq, setWq] = useState<WeeklyQ | null>(null);

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

  if (!wq) return null;

  const handleShare = async () => {
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

  // Truncate story for preview
  const previewText = wq.story.length > 300 ? wq.story.slice(0, 300) + "…" : wq.story;

  return (
    <section className="py-16 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-accent/20 text-accent-foreground text-xs font-display font-semibold rounded-full px-4 py-1.5 mb-3">
            ✨ Question of the Week
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
                className="w-40 h-40 object-contain rounded-xl"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
          )}

          {wq.story_title && (
            <h3 className="font-display text-xl font-bold text-center mb-4">{wq.story_title}</h3>
          )}

          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line mb-6">
            {previewText}
          </p>

          <div className="flex justify-center gap-3">
            <Button variant="accent" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share This Story
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyQuestion;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoMain from "@/assets/logo-main.png";

interface FeedQuestion {
  id: string;
  question_text: string;
  child_name: string;
  child_age: number;
  metaphor_title: string;
  image_url: string | null;
}

const WATERCOLOR_ACCENTS = [
  "/metaphor-images/bird_watercolor-2.png",
  "/metaphor-images/stars_watercolor-2.png",
  "/metaphor-images/moon_watercolor-2.png",
  "/metaphor-images/rainbow_watercolor-2.png",
  "/metaphor-images/sun_watercolor-2.png",
  "/metaphor-images/whale_watercolor-2.png",
  "/metaphor-images/turtle_watercolor-2.png",
  "/metaphor-images/owl_watercolor-2.png",
  "/metaphor-images/rabbit_watercolor-2.png",
];

const InstagramFeed = () => {
  const [questions, setQuestions] = useState<FeedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("questions")
        .select("id, question_text, child_name, child_age, metaphor_title, image_url")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(9);
      setQuestions(data || []);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  if (loading || questions.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Instagram className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-display font-bold text-foreground">
            @littlemindsbigquestions
          </h2>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {questions.map((q, i) => (
            <Link
              key={q.id}
              to={`/result/${q.id}`}
              className="aspect-square rounded-2xl bg-[hsl(var(--card))] border border-border p-4 md:p-5 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-200 overflow-hidden group shadow-sm hover:shadow-md"
            >
              {/* Watercolor accent */}
              <div className="flex justify-center mb-2">
                <img
                  src={q.image_url || WATERCOLOR_ACCENTS[i % WATERCOLOR_ACCENTS.length]}
                  alt=""
                  className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Question text */}
              <p className="font-display font-semibold text-foreground text-xs md:text-sm leading-snug line-clamp-3 text-center flex-1 flex items-center justify-center">
                "{q.question_text}"
              </p>

              {/* Footer */}
              <div className="mt-auto pt-2 border-t border-border/50">
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-display text-center truncate">
                  {q.child_name}, age {q.child_age}
                </p>
                <div className="flex justify-center mt-1">
                  <img src={logoMain} alt="" className="h-4 md:h-5 opacity-60" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 font-display">
          Real questions from real little minds
        </p>
      </div>
    </section>
  );
};

export default InstagramFeed;

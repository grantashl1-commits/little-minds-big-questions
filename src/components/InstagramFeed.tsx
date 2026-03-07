import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedQuestion {
  id: string;
  question_text: string;
  child_name: string;
  child_age: number;
  metaphor_title: string;
}

const PASTEL_COLORS = [
  "bg-primary/30",
  "bg-secondary/30",
  "bg-accent/30",
  "bg-sage/30",
  "bg-peach/30",
  "bg-primary/20",
  "bg-secondary/20",
  "bg-accent/20",
  "bg-sage/20",
];

const InstagramFeed = () => {
  const [questions, setQuestions] = useState<FeedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("questions")
        .select("id, question_text, child_name, child_age, metaphor_title")
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
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {questions.map((q, i) => (
            <Link
              key={q.id}
              to={`/result/${q.id}`}
              className={`aspect-square rounded-xl ${PASTEL_COLORS[i % PASTEL_COLORS.length]} p-3 md:p-4 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-200 overflow-hidden group`}
            >
              <p className="font-display font-semibold text-foreground text-xs md:text-sm leading-snug line-clamp-4">
                "{q.question_text}"
              </p>
              <div className="mt-auto">
                <p className="text-[10px] md:text-xs text-muted-foreground font-display truncate">
                  {q.child_name}, age {q.child_age}
                </p>
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

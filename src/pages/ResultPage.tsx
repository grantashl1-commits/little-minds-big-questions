import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { THEMES, FEATURED_QUESTIONS } from "@/lib/constants";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Check featured questions first (for demo)
      const featured = FEATURED_QUESTIONS.find(q => q.id === id);
      if (featured) {
        setQuestion(featured);
        setThemes(featured.themes || []);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setQuestion(data);
        // Load themes
        const { data: qt } = await supabase
          .from("question_themes")
          .select("theme_id, themes(slug, theme_name)")
          .eq("question_id", data.id);
        if (qt) {
          setThemes(qt.map((r: any) => r.themes?.slug).filter(Boolean));
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-float">📖</div>
            <p className="font-display text-muted-foreground">Loading your story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="font-display text-lg mb-4">Question not found</p>
            <Button asChild>
              <Link to="/ask">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const themeNames = themes.map(slug => {
    const t = THEMES.find(th => th.slug === slug);
    return t ? t : { name: slug, slug, emoji: "🏷️" };
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-16 px-6">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-display text-sm text-muted-foreground mb-2">
              {question.child_name} asked (age {question.child_age}):
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">"{question.question_text}"</h1>
          </div>

          {/* Story Card */}
          <div className="bg-card rounded-2xl p-8 md:p-10 storybook-shadow mb-8">
            <h2 className="font-display text-2xl font-bold text-center mb-6">
              {question.metaphor_title}
            </h2>
            <div className="text-base leading-relaxed whitespace-pre-line mb-6">
              {question.metaphor_answer}
            </div>
            <div className="flex flex-wrap gap-2">
              {themeNames.map((t: any) => (
                <Link
                  key={t.slug}
                  to={`/browse?theme=${t.slug}`}
                  className="text-xs font-display bg-primary/20 rounded-full px-3 py-1 hover:bg-primary/30 transition-colors"
                >
                  {t.emoji} {t.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Parent Explanation */}
          <div className="bg-sage/20 rounded-2xl p-8 mb-8">
            <h3 className="font-display font-bold text-lg mb-3">👩‍👧 For Parents</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {question.parent_explanation}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/ask">Ask Another Question</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to={`/browse${themes.length ? `?theme=${themes[0]}` : ""}`}>
                Browse Similar Questions
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ResultPage;

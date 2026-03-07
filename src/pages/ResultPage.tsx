import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import StoryCardGenerator from "@/components/StoryCardGenerator";
import FloatingBubbles from "@/components/FloatingBubbles";
import { THEMES, FEATURED_QUESTIONS } from "@/lib/constants";
import { toast } from "sonner";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      const featured = FEATURED_QUESTIONS.find(q => q.id === id);
      if (featured) {
        setQuestion(featured);
        setThemes(featured.themes || []);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setQuestion(data);
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

  const copyStoryText = async () => {
    if (!question) return;
    const text = `"${question.question_text}"\n\n${question.metaphor_title}\n\n${question.metaphor_answer}\n\n— ${question.child_name}, age ${question.child_age}\n\nFrom Little Minds BIG Questions`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Story copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <img src="/metaphor-images/owl_watercolor-2.png" alt="" className="w-28 h-28 mx-auto mb-4 animate-float" />
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
    return t ? t : { name: slug, slug, image: "" };
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-16 px-6 relative">
        <FloatingBubbles count={5} />
        <div className="container max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-display text-sm text-muted-foreground mb-2">
              {question.child_name} asked (age {question.child_age}):
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">"{question.question_text}"</h1>

            {question.audio_uploaded && question.audio_url && (
              <div className="max-w-sm mx-auto">
                <AudioPlayer audioUrl={question.audio_url} />
              </div>
            )}
          </div>

          {/* Watercolor Image */}
          {question.image_url && (
            <div className="flex justify-center mb-8">
              <img
                src={question.image_url}
                alt={question.metaphor_title}
                className="w-52 h-52 md:w-72 md:h-72 object-contain rounded-2xl"
              />
            </div>
          )}

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
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Copy Story Text */}
          <div className="flex justify-center mb-8">
            <Button variant="outline" onClick={copyStoryText} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Story Text"}
            </Button>
          </div>

          {/* Parent Explanation */}
          <div className="bg-sage/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <img src="/metaphor-images/owl_watercolor-2.png" alt="" className="w-8 h-8" />
              <h3 className="font-display font-bold text-lg">For Parents</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {question.parent_explanation}
            </p>
          </div>

          {/* Social Media Tile Preview */}
          <div className="bg-card rounded-2xl p-8 storybook-shadow mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Share as a Tile</h3>
              <span className="flex items-center gap-1 text-xs font-display text-muted-foreground bg-accent/20 rounded-full px-3 py-1">
                <Lock className="w-3 h-3" />
                Premium — Coming Soon
              </span>
            </div>

            {/* Preview tile */}
            <div className="bg-primary/10 rounded-xl p-6 max-w-sm mx-auto aspect-square flex flex-col justify-between">
              <div>
                <p className="font-display font-bold text-sm mb-2">"{question.question_text}"</p>
                <p className="text-xs text-muted-foreground">{question.child_name}, age {question.child_age}</p>
              </div>
              {question.image_url && (
                <div className="flex justify-center my-3">
                  <img src={question.image_url} alt="" className="w-20 h-20 object-contain" />
                </div>
              )}
              <div>
                <p className="text-xs leading-relaxed line-clamp-3">{question.metaphor_answer}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-display">Little Minds BIG Questions</p>
              </div>
            </div>

            <div className="mt-4">
              <StoryCardGenerator question={question} />
            </div>
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

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Lock, Bookmark, BookmarkCheck, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import StoryCardGenerator from "@/components/StoryCardGenerator";
import FloatingBubbles from "@/components/FloatingBubbles";
import ReadToMe from "@/components/ReadToMe";
import { THEMES, FEATURED_QUESTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isMember } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  // Check if already saved
  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("saved_questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", id)
      .maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
  }, [user, id]);

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

  const handleSave = async () => {
    if (!user || !id) return;
    setSavingAction(true);
    if (isSaved) {
      await supabase.from("saved_questions").delete().eq("user_id", user.id).eq("question_id", id);
      setIsSaved(false);
      toast.success("Removed from library");
    } else {
      const { error } = await supabase.from("saved_questions").insert({ user_id: user.id, question_id: id });
      if (error) toast.error("Could not save");
      else { setIsSaved(true); toast.success("Saved to library!"); }
    }
    setSavingAction(false);
  };

  const handleTogglePublic = async () => {
    if (!question || !id) return;
    setSavingAction(true);
    const newVal = !question.is_public;
    const { error } = await supabase.from("questions").update({ is_public: newVal }).eq("id", id);
    if (error) toast.error("Could not update");
    else {
      setQuestion({ ...question, is_public: newVal });
      toast.success(newVal ? "Story is now public" : "Story is now private");
    }
    setSavingAction(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setSavingAction(true);
    try {
      await supabase.from("question_themes").delete().eq("question_id", id);
      await supabase.from("saved_questions").delete().eq("question_id", id);
      await supabase.from("analytics").delete().eq("question_id", id);
      await supabase.from("content_assets").delete().eq("question_id", id);
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Story deleted");
      navigate("/browse");
    } catch {
      toast.error("Could not delete story");
    } finally {
      setSavingAction(false);
    }
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
                 className="w-52 h-52 md:w-72 md:h-72 object-contain rounded-2xl drop-shadow-sm"
                 style={{ mixBlendMode: "multiply" }}
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
               {themeNames.map((t: any) => {
                 const colorMap: Record<string, string> = {
                   "death-dying": "bg-secondary/30",
                   "grief-loss": "bg-primary/30",
                   "feelings": "bg-accent/30",
                   "friendship": "bg-sage/30",
                   "identity": "bg-peach/30",
                   "family-change": "bg-secondary/30",
                   "school-confidence": "bg-primary/30",
                   "kindness": "bg-sage/30",
                   "bodies": "bg-accent/30",
                   "spirituality": "bg-peach/30",
                   "worry-anxiety": "bg-secondary/30",
                   "babies-birth": "bg-primary/30",
                 };
                 return (
                   <Link
                     key={t.slug}
                     to={`/browse?theme=${t.slug}`}
                     className={`text-xs font-display rounded-full px-3 py-1 hover:opacity-80 transition-colors ${colorMap[t.slug] || "bg-primary/20"}`}
                   >
                     {t.name}
                   </Link>
                 );
               })}
            </div>
          </div>

          {/* Read to Me */}
          <ReadToMe storyText={question.metaphor_answer} title={question.metaphor_title} />

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button variant="outline" onClick={copyStoryText} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Story Text"}
            </Button>

            {/* Save to Library — members only */}
            {user && isMember ? (
              <Button
                variant={isSaved ? "sage" : "outline"}
                onClick={handleSave}
                disabled={savingAction}
                className="gap-2"
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? "Saved" : "Save to Library"}
              </Button>
            ) : (
              <Button variant="outline" disabled className="gap-2 opacity-60">
                <Lock className="w-4 h-4" />
                Save to Library
                <span className="text-xs">(Members)</span>
              </Button>
            )}

            {/* Privacy toggle — members who saved */}
            {user && isMember && isSaved && (
              <Button
                variant="outline"
                onClick={handleTogglePublic}
                disabled={savingAction}
                className="gap-2"
              >
                {question.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {question.is_public ? "Public" : "Private"}
              </Button>
            )}
          </div>

          {/* Parent Explanation */}
          <div className="bg-sage/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <img src="/metaphor-images/owl_watercolor-2.png" alt="" className="w-16 h-16" />
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

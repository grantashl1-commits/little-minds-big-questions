import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBubbles from "@/components/FloatingBubbles";
import { getAgeGroup } from "@/lib/constants";
import { toast } from "sonner";
import { Mic, Lock, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ChildProfile } from "@/components/ChildProfileManager";

const AskPage = () => {
  const navigate = useNavigate();
  const { user, isMember } = useAuth();
  const [loading, setLoading] = useState(false);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [form, setForm] = useState({
    child_name: "",
    child_age: 5,
    question_text: "",
    context: "",
    parent_note: "",
    is_public: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, is_public: e.target.checked }));
  };

  // Load child profiles for logged-in members
  useState(() => {
    if (user && isMember) {
      supabase
        .from("child_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at")
        .then(({ data }) => {
          if (data) setChildProfiles(data as ChildProfile[]);
        });
    }
  });

  const selectChild = (profileId: string) => {
    const p = childProfiles.find((c) => c.id === profileId);
    if (p) {
      setForm((prev) => ({
        ...prev,
        child_name: p.name,
        child_age: p.age || prev.child_age,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.child_name.trim() || !form.question_text.trim()) {
      toast.error("Please fill in the child's name and question.");
      return;
    }
    if (form.child_age < 2 || form.child_age > 10) {
      toast.error("Age must be between 2 and 10.");
      return;
    }

    setLoading(true);
    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke<any>("generate-answer", {
        body: {
          child_name: form.child_name.trim(),
          child_age: form.child_age,
          question_text: form.question_text.trim(),
          context: form.context.trim(),
          parent_note: form.parent_note.trim(),
        },
      });

      if (aiError) throw aiError;
      if (aiData.rejected) {
        toast.error(aiData.rejection_reason || "That question isn't appropriate. Please try a different one.");
        return;
      }

      const { data: question, error: dbError } = await supabase
        .from("questions")
        .insert({
          child_name: form.child_name.trim(),
          child_age: form.child_age,
          age_group: getAgeGroup(form.child_age),
          question_text: form.question_text.trim(),
          context: form.context.trim() || null,
          parent_note: form.parent_note.trim() || null,
          metaphor_title: aiData.metaphor_title,
          metaphor_answer: aiData.metaphor_answer,
          parent_explanation: aiData.parent_explanation,
          image_prompt: aiData.image_prompt,
          image_url: aiData.image_url || null,
          is_public: form.is_public,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (aiData.themes && aiData.themes.length > 0) {
        const { data: themeRows } = await supabase
          .from("themes")
          .select("id, slug")
          .in("slug", aiData.themes);

        if (themeRows && themeRows.length > 0) {
          await supabase.from("question_themes").insert(
            themeRows.map((t: any) => ({
              question_id: question.id,
              theme_id: t.id,
            }))
          );
        }
      }

      toast.success("Your story answer is ready!");
      navigate(`/result/${question.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <section className="py-16 px-6 relative">
        <FloatingBubbles count={5} />
        <div className="container max-w-2xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">Ask a Question</h1>
          <p className="text-muted-foreground text-center mb-6">
            Tell us what your child asked. We'll turn it into a gentle story.
          </p>



          <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-2xl p-8 storybook-shadow">
            {/* Child profile selector */}
            {childProfiles.length > 0 && (
              <div>
                <label className="block font-display font-semibold text-sm mb-2">Ask a question for:</label>
                <div className="flex flex-wrap gap-2">
                  {childProfiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectChild(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-display transition-all ${
                        form.child_name === p.name
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      <span>{p.avatar_emoji}</span> {p.name}{p.age ? ` (age ${p.age})` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-display font-semibold text-sm mb-2">Child's First Name</label>
              <input
                type="text"
                name="child_name"
                value={form.child_name}
                onChange={handleChange}
                placeholder="Ruby"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block font-display font-semibold text-sm mb-2">Child's Age</label>
              <input
                type="number"
                name="child_age"
                value={form.child_age}
                onChange={handleChange}
                min={2}
                max={10}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block font-display font-semibold text-sm mb-2">What did your child ask?</label>
              <textarea
                name="question_text"
                value={form.question_text}
                onChange={handleChange}
                placeholder="Mum, what happens when we die?"
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>

            <div>
              <label className="block font-display font-semibold text-sm mb-2">What sparked this question? <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                name="context"
                value={form.context}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="block font-display font-semibold text-sm mb-2">Any beliefs or context we should respect? <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                name="parent_note"
                value={form.parent_note}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={isMember ? handleCheckbox : undefined}
                disabled={!isMember}
                className="mt-1 w-5 h-5 rounded accent-primary disabled:opacity-50"
              />
              <div>
                <span className="text-sm text-foreground font-display font-semibold">
                  Make this answer public
                </span>
                {isMember ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Uncheck to keep this story private. Only you will have the link.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Lock className="w-3 h-3 inline" />
                    Private stories are a members-only feature.{" "}
                    <Link to="/dashboard" className="text-primary underline">Upgrade</Link>
                  </p>
                )}
              </div>
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating your story..." : "Create Story Answer"}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AskPage;

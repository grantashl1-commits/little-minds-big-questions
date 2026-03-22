import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoiceRecorder from "@/components/VoiceRecorder";
import { getAgeGroup } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LOADING_MESSAGES = [
  "Turning their words into a gentle story...",
  "Weaving in warm bedtime imagery...",
  "Finishing the illustration and final polish...",
];

const AskChildPage = () => {
  const navigate = useNavigate();
  const { user, isMember } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmedText, setConfirmedText] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [form, setForm] = useState({
    child_name: "",
    child_age: 5,
    context: "",
    is_public: true,
  });

  const handleConfirmed = useCallback((text: string, blob: Blob) => {
    setConfirmedText(text);
    setAudioBlob(blob);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.child_name.trim() || !confirmedText.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let audioUrl: string | null = null;
      if (audioBlob) {
        const filename = `${Date.now()}-${form.child_name.toLowerCase()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("audio-recordings")
          .upload(filename, audioBlob, { contentType: "audio/webm" });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("audio-recordings")
          .getPublicUrl(uploadData.path);
        audioUrl = urlData.publicUrl;
      }

      const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-answer", {
        body: {
          child_name: form.child_name.trim(),
          child_age: form.child_age,
          question_text: confirmedText.trim(),
          context: form.context.trim(),
          parent_note: "",
        },
      });
      if (aiError) throw aiError;
      if (aiData?.error) throw new Error(aiData.error);
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
          question_text: confirmedText.trim(),
          context: form.context.trim() || null,
          metaphor_title: aiData.metaphor_title,
          metaphor_answer: aiData.metaphor_answer,
          parent_explanation: aiData.parent_explanation,
          image_prompt: aiData.image_prompt,
          image_url: aiData.image_url || null,
          is_public: form.is_public,
          user_id: user?.id || null,
          audio_url: audioUrl,
          transcription: confirmedText.trim(),
          audio_uploaded: !!audioBlob,
        })
        .select()
        .single();
      if (dbError) throw dbError;

      if (aiData.themes?.length > 0) {
        const { data: themeRows } = await supabase
          .from("themes")
          .select("id, slug")
          .in("slug", aiData.themes);
        if (themeRows?.length) {
          await supabase.from("question_themes").insert(
            themeRows.map((t: any) => ({ question_id: question.id, theme_id: t.id }))
          );
        }
      }

      toast.success("Your story answer is ready!");
      navigate(`/result/${question.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-peach/20 via-background to-sage/10">
      <Navbar />
      <section className="py-12 md:py-16 px-6">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-coral to-primary bg-clip-text text-transparent">
              Got a Big Question?
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-display">
              Press the button and ask it out loud. If we miss it, you can re-record.
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-10 storybook-shadow mb-8">
            <VoiceRecorder onConfirmed={handleConfirmed} />
          </div>

          {confirmedText && (
            <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-2xl p-8 storybook-shadow animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-background rounded-xl p-4 border border-input">
                <p className="font-display font-semibold text-sm mb-1">Their question:</p>
                <p className="text-foreground">{confirmedText}</p>
              </div>

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
                <label className="block font-display font-semibold text-sm mb-2">
                  What sparked this question? <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  name="context"
                  value={form.context}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={isMember ? (e) => setForm((prev) => ({ ...prev, is_public: e.target.checked })) : undefined}
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating your story...
                  </>
                ) : "Create Story Answer"}
              </Button>
            </form>
          )}
        </div>
      </section>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
          <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center storybook-shadow">
            <img src="/metaphor-images/butterfly.png" alt="Story illustration loading" className="mx-auto mb-5 h-24 w-24 animate-float object-contain" />
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="font-display text-2xl font-bold">We’re making the story now</h2>
            <p className="mt-3 text-sm text-muted-foreground">{LOADING_MESSAGES[loadingMessageIndex]}</p>
            <p className="mt-2 text-xs text-muted-foreground">Hang tight — artwork can make this take a little longer.</p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AskChildPage;

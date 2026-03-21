import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBubbles from "@/components/FloatingBubbles";

const SharedStoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) { setLoading(false); return; }

      const { data: share } = await supabase
        .from("shares" as any)
        .select("*")
        .eq("public_slug", slug)
        .maybeSingle();

      if (!share) { setLoading(false); return; }

      // Check expiration
      if ((share as any).expires_at && new Date((share as any).expires_at) < new Date()) {
        setExpired(true);
        setLoading(false);
        return;
      }

      const { data: question } = await supabase
        .from("questions")
        .select("*")
        .eq("id", (share as any).question_id)
        .single();

      if (question) {
        const redacted = (share as any).redacted;
        setStory({
          ...question,
          child_name: redacted ? "A child" : (question as any).child_name,
          parent_note: redacted ? null : (question as any).parent_note,
        });
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <img src="/metaphor-images/owl.png" alt="" className="w-28 h-28 mx-auto animate-float object-contain" />
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-center">
          <div>
            <p className="font-display text-lg mb-2">This shared link has expired</p>
            <p className="text-sm text-muted-foreground">Ask the story creator for a new link.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-center">
          <p className="font-display text-lg">Story not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-16 px-6 relative">
        <FloatingBubbles count={4} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="font-display text-sm text-muted-foreground mb-2">
              {story.child_name} asked (age {story.child_age}):
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">"{story.question_text}"</h1>
          </div>

          {story.image_url && (
            <div className="flex justify-center mb-8">
              <img
                src={story.image_url}
                alt={story.metaphor_title}
                className="w-52 h-52 md:w-72 md:h-72 object-contain rounded-2xl drop-shadow-sm"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
          )}

          <div className="bg-card rounded-2xl p-8 md:p-10 storybook-shadow mb-8">
            <h2 className="font-display text-2xl font-bold text-center mb-6">
              {story.metaphor_title}
            </h2>
            <div className="text-base leading-relaxed whitespace-pre-line">
              {story.metaphor_answer}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Shared from <span className="font-display font-semibold">Little Minds BIG Questions</span></p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SharedStoryPage;

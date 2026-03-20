import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useRef } from "react";

interface StoryData {
  id: string;
  question_text: string;
  metaphor_title: string;
  metaphor_answer: string;
  child_name: string;
  child_age: number;
  image_url: string | null;
}

const StoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_text, metaphor_title, metaphor_answer, child_name, child_age, image_url")
        .eq("id", id)
        .single();
      if (!error && data) setStory(data);
      setLoading(false);
    };
    fetchStory();
  }, [id]);

  const toggleReadAloud = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!story) return;
    const text = `${story.metaphor_title}. ${story.metaphor_answer}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="font-display text-lg text-muted-foreground">Story not found</p>
          <Button variant="coral" onClick={() => navigate("/")}>Go Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-12 md:py-20 px-6">
        <div className="container max-w-3xl mx-auto">
          <Button
            variant="coral"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-8 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {story.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8 storybook-shadow">
              <img
                src={story.image_url}
                alt={story.metaphor_title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2 text-foreground">
            {story.question_text}
          </h1>
          <p className="text-sm text-muted-foreground font-display mb-8">
            Asked by {story.child_name}, age {story.child_age}
          </p>

          <h2 className="text-xl md:text-2xl font-bold font-display text-primary mb-4">
            {story.metaphor_title}
          </h2>

          <div className="prose prose-lg max-w-none text-foreground leading-relaxed font-body whitespace-pre-line mb-8">
            {story.metaphor_answer}
          </div>

          <Button
            variant={speaking ? "secondary" : "coral"}
            size="lg"
            onClick={toggleReadAloud}
            className="gap-2"
          >
            {speaking ? (
              <>
                <VolumeX className="w-5 h-5" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Read Aloud
              </>
            )}
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default StoryPage;

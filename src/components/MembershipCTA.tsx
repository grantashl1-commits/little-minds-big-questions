import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Lock, Mic, Download, FolderHeart, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const benefits = [
  { icon: FolderHeart, text: "Save stories to a private library" },
  { icon: Lock, text: "Keep stories private — only you have the link" },
  { icon: Mic, text: '"Read to Me" — AI narration in bedtime & daytime voices' },
  { icon: Download, text: "Download story cards & Instagram carousels" },
  { icon: BookOpen, text: "Create printable storybooks" },
  { icon: Sparkles, text: "Organise stories into collections" },
];

const MembershipCTA = () => {
  const { user, isMember } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isMember) return null;

  return (
    <section className="py-16 px-6">
      <div className="container max-w-3xl mx-auto">
        <div className="rounded-2xl border-2 border-accent bg-card p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

          <p className="text-sm font-semibold tracking-wide text-accent-foreground/70 uppercase mb-2">
            Limited Time Offer
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Founding Member Special — 50% Off
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-muted-foreground line-through text-lg">$20 NZD</span>
            <span className="text-4xl font-bold text-foreground">$10</span>
            <span className="text-muted-foreground text-sm">NZD · one-time</span>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
                <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            variant="accent"
            onClick={handleCheckout}
            disabled={loading}
            className="text-base px-10"
          >
            {loading ? "Loading…" : "Become a Founding Member"}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground mt-4">
              You'll be asked to create a free account first.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MembershipCTA;

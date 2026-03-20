import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FolderHeart, Mic, BookOpen, Download, Sparkles, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

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
      if (data?.url) window.location.href = data.url;
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isMember) return null;

  return (
    <section className="py-16 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Build Your Child's Story Library
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every big question deserves to be remembered. Create a private collection of stories that grows with your child.
          </p>
        </div>

        {/* Free vs Member comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Free tier */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-display font-bold text-lg mb-1">Free</p>
            <p className="text-sm text-muted-foreground mb-4">Explore and discover</p>
            <ul className="space-y-2.5">
              {[
                "Ask questions & generate stories",
                "Browse public story library",
                "Temporary audio preview",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mt-0.5 shrink-0 text-border" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Member tier */}
          <div className="rounded-2xl border-2 border-accent bg-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display font-bold text-lg">Member</p>
              <span className="bg-accent/20 text-accent-foreground text-xs font-display font-semibold rounded-full px-2.5 py-0.5">
                50% Off
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-muted-foreground line-through text-sm">$20</span>
              <span className="text-2xl font-bold text-foreground">$10 NZD</span>
              <span className="text-xs text-muted-foreground">one-time</span>
            </div>
            <ul className="space-y-2.5">
              {[
                { icon: FolderHeart, text: "Save stories to a private library" },
                { icon: Sparkles, text: "Create child profiles & collections" },
                { icon: Mic, text: "Listen anytime — bedtime & daytime voices" },
                { icon: Download, text: "Download story cards & carousels" },
                { icon: BookOpen, text: "Create printable storybooks" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="coral"
            onClick={handleCheckout}
            disabled={loading}
            className="text-base px-10"
          >
            {loading ? "Loading…" : "Create My Child's Story Library"}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground mt-3">
              You'll be asked to create a free account first.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MembershipCTA;

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FolderHeart, Mic, BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface SaveUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
}

const SaveUpgradeModal = ({ open, onOpenChange, childName }: SaveUpgradeModalProps) => {
  const { user } = useAuth();
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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayName = childName || "your child";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Save this story for {displayName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Stories disappear after you leave the page. Members create a private story library for their children.
          </DialogDescription>
        </DialogHeader>

        {/* Preview of what a library looks like */}
        <div className="bg-primary/5 rounded-xl p-4 my-2">
          <p className="font-display font-semibold text-sm mb-2">{displayName}'s Story Library</p>
          <div className="space-y-1.5">
            {["Why do people die?", "Why do people bully?", "Why do we feel sad?"].map((q) => (
              <div key={q} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderHeart className="h-3 w-3 text-primary shrink-0" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-muted-foreground line-through text-sm">$20 NZD</span>
            <span className="text-2xl font-bold text-foreground">$10</span>
            <span className="text-muted-foreground text-xs">NZD · one-time</span>
          </div>

          <ul className="space-y-1.5 text-sm">
            {[
              { icon: FolderHeart, text: "Save stories forever" },
              { icon: Mic, text: "Listen anytime — bedtime & daytime voices" },
              { icon: BookOpen, text: "Create printable storybooks" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-foreground">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            variant="accent"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full text-base"
          >
            {loading ? "Loading…" : `Create ${displayName}'s Story Library`}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              You'll be asked to create a free account first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveUpgradeModal;

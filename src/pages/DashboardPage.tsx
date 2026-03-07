import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Library, Star, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const DashboardPage = () => {
  const { user, isMember, loading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Could not start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back{user.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""} ✨
        </h1>
        <p className="text-muted-foreground mb-8">
          {isMember
            ? "You're a Founding Member — thank you!"
            : "Upgrade to unlock saving, private stories, and book creation."}
        </p>

        {!isMember && (
          <Card className="mb-8 border-accent/50 bg-accent/10">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
              <p className="font-display text-lg font-semibold mb-1">Founding Member Special — 50% Off</p>
              <p className="text-muted-foreground text-sm mb-4">
                <span className="line-through mr-2">$20 NZD</span>
                <span className="text-foreground font-bold text-lg">$10 NZD</span> one-time
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redirecting…
                  </>
                ) : (
                  "Become a Founding Member"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Card className={!isMember ? "opacity-60" : ""}>
            <CardHeader>
              <Library className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg font-display">My Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save and organise your stories. {!isMember && "(Members only)"}
              </p>
            </CardContent>
          </Card>
          <Card className={!isMember ? "opacity-60" : ""}>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-secondary mb-2" />
              <CardTitle className="text-lg font-display">Create a Book</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Turn stories into a printable book. {!isMember && "(Members only)"}
              </p>
            </CardContent>
          </Card>
          <Card className={!isMember ? "opacity-60" : ""}>
            <CardHeader>
              <Star className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg font-display">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Group stories by child or theme. {!isMember && "(Members only)"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

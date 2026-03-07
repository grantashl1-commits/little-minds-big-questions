import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve
    if (!sessionId || !user) {
      setErrorMsg("Not authenticated. Please log in and try again.");
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        setStatus("success");

        // Force re-check membership in auth context by reloading after a beat
        setTimeout(() => window.location.replace("/dashboard"), 2500);
      } catch (err: any) {
        setErrorMsg(err.message || "Something went wrong");
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="font-display text-2xl font-bold mb-2">Confirming your payment…</h1>
              <p className="text-muted-foreground">Just a moment while we unlock your membership.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-sage mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Welcome, Founding Member! 🎉</h1>
              <p className="text-muted-foreground mb-6">
                Your membership is now active. Redirecting you to your dashboard…
              </p>
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-4">{errorMsg}</p>
              <Button asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;

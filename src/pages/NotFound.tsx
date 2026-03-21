import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBubbles from "@/components/FloatingBubbles";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20 relative">
        <FloatingBubbles count={4} />
        <div className="text-center relative z-10">
          <img
            src="/metaphor-images/penguin.png"
            alt=""
            className="w-28 h-28 mx-auto mb-6"
          />
          <h1 className="font-display text-5xl font-bold text-foreground mb-3">404</h1>
          <p className="font-display text-lg text-muted-foreground mb-6">
            Oops! This page doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/browse">Browse Questions</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

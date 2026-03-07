import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";
import { Mic } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-6">
      {/* Floating dots intentionally blank here — moved to around hero image */}

      <div className="container max-w-5xl mx-auto grid md:grid-cols-[1fr,auto] gap-12 items-center relative z-10">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
            Little Minds
            <br />
            <span className="text-primary">Big Questions</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Curious kids ask big questions. This space helps parents answer them with gentle stories and metaphors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" asChild>
              <Link to="/ask">Ask a Question</Link>
            </Button>
            <Button size="lg" variant="peach" asChild>
              <Link to="/ask-child" className="gap-2">
                <Mic className="w-4 h-4" />
                Let Your Child Ask
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/browse">Browse Questions</Link>
            </Button>
          </div>
        </div>
        <div className="hidden md:flex justify-end animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <img
            src={heroImage}
            alt="A child looking up at the sky thinking - watercolour illustration"
            className="w-72 lg:w-80 xl:w-96 object-contain" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

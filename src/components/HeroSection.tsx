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
        <div className="hidden md:flex justify-end animate-fade-in-up relative" style={{ animationDelay: "0.3s" }}>
          {/* Floating colored dots around the boy */}
          <div className="absolute -top-4 -left-6 w-10 h-10 rounded-full bg-primary opacity-30 animate-float pointer-events-none" style={{ animationDelay: "0s" }} />
          <div className="absolute top-12 -right-8 w-7 h-7 rounded-full bg-secondary opacity-30 animate-float pointer-events-none" style={{ animationDelay: "1.2s" }} />
          <div className="absolute bottom-16 -left-10 w-8 h-8 rounded-full bg-accent opacity-25 animate-float pointer-events-none" style={{ animationDelay: "0.6s" }} />
          <div className="absolute -bottom-2 right-8 w-6 h-6 rounded-full bg-sage opacity-30 animate-float pointer-events-none" style={{ animationDelay: "1.8s" }} />
          <div className="absolute top-1/3 -left-12 w-5 h-5 rounded-full bg-peach opacity-35 animate-float pointer-events-none" style={{ animationDelay: "2.4s" }} />
          <div className="absolute top-4 left-1/4 w-4 h-4 rounded-full bg-primary opacity-20 animate-float pointer-events-none" style={{ animationDelay: "0.8s" }} />
          <div className="absolute bottom-1/3 -right-6 w-9 h-9 rounded-full bg-secondary opacity-20 animate-float pointer-events-none" style={{ animationDelay: "1.5s" }} />
          <img
            src={heroImage}
            alt="A child looking up at a dreamy sky with butterflies - watercolour illustration"
            className="w-80 lg:w-96 xl:w-[28rem] object-contain relative z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

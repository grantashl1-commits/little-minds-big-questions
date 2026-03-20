import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";
import logoMain from "@/assets/logo-main.png";
import { Mic } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-6">
      {/* Floating dots intentionally blank here — moved to around hero image */}

      <div className="container max-w-5xl mx-auto grid md:grid-cols-[1fr,auto] gap-12 items-center relative z-10">
        <div className="text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-6 animate-fade-in-up">
            <img src={logoMain} alt="Little Minds Big Questions" className="h-28 md:h-36 lg:h-44 object-contain" />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Curious kids ask big questions. This space helps parents answer them with gentle stories and metaphors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" variant="coral" asChild>
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
        <div className="flex justify-center items-center animate-fade-in-up relative w-48 h-56 md:w-80 md:h-[24rem] lg:w-96 lg:h-[28rem] xl:w-[28rem] xl:h-[32rem] mx-auto md:mx-0" style={{ animationDelay: "0.3s" }}>
          {/* Floating colored dots orbiting around the boy */}
          <div className="absolute w-10 h-10 rounded-full bg-primary opacity-30 pointer-events-none animate-[orbit_8s_linear_infinite]" style={{ top: "10%", left: "5%" }} />
          <div className="absolute w-7 h-7 rounded-full bg-secondary opacity-35 pointer-events-none animate-[orbit_10s_linear_infinite_reverse]" style={{ top: "5%", right: "10%" }} />
          <div className="absolute w-8 h-8 rounded-full bg-accent opacity-25 pointer-events-none animate-[orbit_7s_linear_infinite]" style={{ bottom: "20%", left: "-5%" }} />
          <div className="absolute w-6 h-6 rounded-full bg-sage opacity-30 pointer-events-none animate-[orbit_9s_linear_infinite_reverse]" style={{ bottom: "5%", right: "15%" }} />
          <div className="absolute w-5 h-5 rounded-full bg-peach opacity-35 pointer-events-none animate-[orbit_11s_linear_infinite]" style={{ top: "40%", left: "-8%" }} />
          <div className="absolute w-4 h-4 rounded-full bg-primary opacity-25 pointer-events-none animate-[orbit_6s_linear_infinite_reverse]" style={{ top: "15%", left: "30%" }} />
          <div className="absolute w-9 h-9 rounded-full bg-secondary opacity-20 pointer-events-none animate-[orbit_12s_linear_infinite]" style={{ bottom: "35%", right: "-3%" }} />
          <img
            src={heroImage}
            alt="A child looking up thinking - watercolour illustration"
            className="w-full h-full object-contain relative z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

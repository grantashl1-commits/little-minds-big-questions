import { Link } from "react-router-dom";
import logoMain from "@/assets/logo-main.png";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-card/60 border-t border-border">
      <div className="container max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoMain} alt="Little Minds Big Questions" className="h-10" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gentle storytelling tools for parents and caregivers.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/ask" className="hover:text-foreground transition-colors">Ask a Question</Link></li>
              <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse Questions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This website provides gentle storytelling tools for parents and caregivers and is not a substitute for therapeutic, medical, or professional advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

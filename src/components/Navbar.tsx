import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoSeed from "@/assets/logo-seed.png";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <img src={logoSeed} alt="Little Minds Big Questions" className="w-8 h-8 rounded-full" />
          <span>
            Little Minds <span className="text-xl text-primary font-extrabold">BIG</span> Questions
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">Browse</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/ask">Ask a Question</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

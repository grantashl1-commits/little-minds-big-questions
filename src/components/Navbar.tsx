import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoMain from "@/assets/logo-main.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center">
          <img src={logoMain} alt="Little Minds Big Questions" className="h-14" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">Browse</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/ask">Ask a Question</Link>
          </Button>
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">
                      <User className="h-4 w-4 mr-1" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={signOut} title="Log out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import logoMain from "@/assets/logo-main.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
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
    </>
  );

  const mobileLinks = (
    <div className="flex flex-col gap-3 mt-6">
      <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
        <Link to="/browse">Browse</Link>
      </Button>
      <Button size="sm" asChild onClick={() => setOpen(false)}>
        <Link to="/ask">Ask a Question</Link>
      </Button>
      {!loading && (
        <>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
                <Link to="/dashboard">
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1" />
                Log Out
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" asChild onClick={() => setOpen(false)}>
              <Link to="/auth">Log In / Sign Up</Link>
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center">
          <img src={logoMain} alt="Little Minds Big Questions" className="h-14" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks}
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="font-display">Menu</SheetTitle>
            {mobileLinks}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;

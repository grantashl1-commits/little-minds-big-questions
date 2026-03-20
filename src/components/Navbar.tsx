import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoMain from "@/assets/logo-main.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on route change or escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const authLinks = user ? (
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
  );

  const mobileLink = (to: string, label: string, icon?: React.ReactNode) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-display font-semibold text-foreground hover:bg-muted transition-colors"
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border" ref={menuRef}>
      <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center">
          <img src={logoMain} alt="Little Minds Big Questions" className="h-14" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">Browse</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/ask">Ask a Question</Link>
          </Button>
          {!loading ? authLinks : (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/auth">Log In</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-border bg-background ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-b-0"
        }`}
      >
        <div className="container max-w-5xl mx-auto px-6 py-3 flex flex-col gap-1">
          {mobileLink("/browse", "Browse")}
          {mobileLink("/ask", "Ask a Question")}
          {mobileLink("/ask-child", "Ask in Your Voice")}
          {!loading ? (
            user ? (
              <>
                {mobileLink("/dashboard", "Dashboard", <User className="h-4 w-4" />)}
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-display font-semibold text-foreground hover:bg-muted transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              mobileLink("/auth", "Log In / Sign Up")
            )
          ) : (
            mobileLink("/auth", "Log In / Sign Up")
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

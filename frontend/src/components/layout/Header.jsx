import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Wrench, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/actions";
import NotificationCenter from "../NotificationCenter";

export default function Header() {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isAuthed = isAuthenticated && !!user;

  return (
    <header
      className={
        isAuthed
          ? "sticky top-0 z-40 w-full border-b bg-[#0F172A] text-white"
          : "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${isAuthed ? 'bg-white/10 text-white' : 'bg-brand-gradient text-primary-foreground'}`}>
              <Wrench className="h-5 w-5" />
            </span>
            <span className={`font-extrabold text-lg tracking-tight ${isAuthed ? 'text-white' : ''}`}>
              FixItNow
            </span>
          </Link>
        </div>

        {/* Navigation */}
        {isAuthed ? (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="hover:opacity-90">Dashboard</Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/#services" className="text-muted-foreground hover:text-foreground">Services</a>
            <a href="/#how" className="text-muted-foreground hover:text-foreground">How it works</a>
            <a href="/#pros" className="text-muted-foreground hover:text-foreground">For pros</a>
            <a href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <NotificationCenter />
              <Button variant="ghost" asChild className={isAuthed ? 'text-white hover:bg-white/10' : ''}>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout} size="sm" className={isAuthed ? 'text-white hover:bg-white/10' : ''}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button className="hidden sm:inline-flex" asChild>
                <a href="/#book">Book now</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
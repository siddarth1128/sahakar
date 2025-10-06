import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-bold text-xl">FixItNow</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Book trusted local pros for plumbing, electrical, appliances,
            carpentry and more — fast.
          </p>
          <div className="flex gap-4 mt-4 text-muted-foreground">
            <a aria-label="Twitter" href="https://twitter.com/fixitnow" className="hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a aria-label="Facebook" href="https://facebook.com/fixitnow" className="hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </a>
            <a
              aria-label="Instagram"
              href="https://instagram.com/fixitnow"
              className="hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="/#services" className="hover:text-foreground">
                Services
              </a>
            </li>
            <li>
              <a href="/#how" className="hover:text-foreground">
                How it works
              </a>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="/#pros" className="hover:text-foreground">
                Become a Pro
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-foreground">
                FAQ
              </a>
            </li>
            <li>
              <Link to="/login" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-6 text-sm text-muted-foreground flex items-center justify-between">
          <p>© {year} FixItNow. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://fixitnow.com/privacy" className="hover:text-foreground">
              Privacy
            </a>
            <a href="https://fixitnow.com/terms" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
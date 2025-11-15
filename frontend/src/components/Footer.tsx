import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TalentConnect</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect talent with opportunities. Find your dream job or discover amazing
              hackathons.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-primary">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/hackathons" className="text-muted-foreground hover:text-primary">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-primary">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">For Companies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-primary">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-primary">
                  Host Hackathons
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TalentConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


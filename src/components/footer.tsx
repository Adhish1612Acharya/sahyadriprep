import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">SahyadriPrep</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for interview preparation and career
              success.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/interview-experiences"
                  className="hover:text-primary transition-colors"
                >
                  Interview Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-primary transition-colors"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/interview-experiences/youtube"
                  className="hover:text-primary transition-colors"
                >
                  Interview Sessions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {/* 
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Twitter
                </a>
              </li> */}
              {/* <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Instagram
                </a>
              </li> */}

              <li>
                <a
                  href="https://chat.whatsapp.com/HtZFz8GepZf9rzCDhl8vuI?mode=wwt"
                  className="hover:text-primary transition-colors"
                >
                  Whatsapp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} SahyadriPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

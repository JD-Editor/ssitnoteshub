import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import logo from "@/assets/ssit_logo.asset.json";
import { COURSES } from "@/lib/catalog";

const socials = [
  { label: "Facebook", Icon: Facebook, href: "https://facebook.com" },
  { label: "Instagram", Icon: Instagram, href: "https://instagram.com" },
  { label: "LinkedIn", Icon: Linkedin, href: "https://linkedin.com" },
  { label: "YouTube", Icon: Youtube, href: "https://youtube.com" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="Shree Swaminarayan Institute of Technology logo"
              className="h-12 w-12 rounded-full bg-primary-foreground/95 object-contain p-0.5"
            />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">SSIT Notes Hub</p>
              <p className="text-sm text-primary-foreground/70">Gandhinagar, Gujarat</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/80">
            Semester-wise textbooks, previous year papers and practical files shared by students,
            for students.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-bold uppercase tracking-wide">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/" className="transition-colors hover:text-primary-foreground">
                Home
              </Link>
            </li>
            {COURSES.map((c) => (
              <li key={c.id}>
                <Link
                  to="/course/$course"
                  params={{ course: c.id }}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/bookmarks" className="transition-colors hover:text-primary-foreground">
                Bookmarks
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Shree Swaminarayan Institute of Technology
                  <br />
                  Gandhinagar, Gujarat 382421
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@ssit.edu.in" className="hover:text-primary-foreground">
                  info@ssit.edu.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+917923250001" className="hover:text-primary-foreground">
                  +91 79 2325 0001
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">Follow</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/30 text-primary-foreground/85 transition-colors hover:border-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} SSIT Notes Hub · Made by students of Shree Swaminarayan
          Institute of Technology.
        </div>
      </div>
    </footer>
  );
}

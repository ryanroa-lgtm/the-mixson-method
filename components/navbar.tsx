"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/men", label: "Men" },
  { href: "/women", label: "Women" },
  { href: "/submissions", label: "Submissions" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-heading text-xl tracking-wide uppercase"
          onClick={() => setOpen(false)}
        >
          The Mixson Method
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-body">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-muted hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-[1.5px] bg-foreground transition-all duration-300 ${
              open ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-foreground transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-foreground transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 border-t border-border" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-6 py-8 text-sm tracking-widest uppercase font-body">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={`transition-colors ${
                  pathname === l.href
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import { TransitionProvider } from "@/components/transition-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Mixson Method",
  description:
    "A boutique modeling agency shaped by intention, discipline, and a curated eye.",
};

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/men", label: "Men" },
  { href: "/women", label: "Women" },
  { href: "/submissions", label: "Submissions" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ── Nav ── */}
        <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-heading text-xl tracking-wide uppercase"
            >
              The Mixson Method
            </Link>

            <ul className="flex items-center gap-8 text-sm tracking-widest uppercase font-body">
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
          </nav>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 pt-[73px]">
          <TransitionProvider>{children}</TransitionProvider>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-border py-10 text-center text-sm text-muted">
          <p className="font-heading text-base tracking-wide uppercase mb-2">
            The Mixson Method
          </p>
          <p>&copy; {new Date().getFullYear()} The Mixson Method. All rights reserved.</p>
          <a
            href="https://www.instagram.com/themixsonmethod/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block hover:text-foreground transition-colors"
          >
            Instagram
          </a>
        </footer>
      </body>
    </html>
  );
}

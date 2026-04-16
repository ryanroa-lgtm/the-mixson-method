import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
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
        <Navbar />

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

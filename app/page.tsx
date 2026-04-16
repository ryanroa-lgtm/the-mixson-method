"use client";

import { useEffect, useState } from "react";

const heroImages = [
  "/hero/1970-01-21-082505542.jpg",
  "/hero/1970-01-21-082505680.jpg",
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center">
      {/* Hero background images */}
      {heroImages.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={src}
            alt="The Mixson Method"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center px-6">
        <h1 className="font-heading text-5xl md:text-7xl tracking-wide uppercase mb-6 text-white">
          The Mixson Method
        </h1>
        <p className="text-white/70 text-lg md:text-xl tracking-widest uppercase font-body">
          Intention. Discipline. Direction.
        </p>
      </div>
    </section>
  );
}

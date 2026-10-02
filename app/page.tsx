import Link from "next/link";
import { getModelBySlug } from "@/data/models";

// Homepage feature slot — swap the slug to rotate the Featured Model.
const FEATURED_SLUG = "jesse-tarr";

export default function Home() {
  const featured = getModelBySlug(FEATURED_SLUG);

  return (
    <>
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center">
      {/* Hero background video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="/hero/2026-04-16-113024286.mp4"
        />
      </div>
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

    {/* Featured Model */}
    {featured && (
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Link
            href={`/${featured.category}/${featured.slug}`}
            className="group block overflow-hidden"
          >
            <img
              src={featured.heroImage}
              alt={featured.name}
              className="w-full transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-widest text-muted mb-4">
              Featured Model
            </p>
            <h2 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-4">
              {featured.name}
            </h2>
            {featured.subtitle && (
              <p className="text-muted text-sm md:text-base tracking-widest uppercase mb-10">
                {featured.subtitle}
              </p>
            )}
            <Link
              href={`/${featured.category}/${featured.slug}`}
              className="inline-block bg-foreground text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </section>
    )}
    </>
  );
}

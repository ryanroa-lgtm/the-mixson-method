import Link from "next/link";
import { getModelsByCategory } from "@/data/models";
import { ModelCard } from "@/components/model-card";

export default function WomenPage() {
  const women = getModelsByCategory("women");
  const featured = women.filter((m) => m.featured);
  const roster = women.filter((m) => !m.featured);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-16 text-center">
        Women
      </h1>

      {/* Featured Talent */}
      {featured.length > 0 && (
        <div className="mb-24">
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-10 text-center text-muted">
            Featured Talent
          </h2>
          {featured.map((m) => (
            <Link
              key={m.slug}
              href={`/women/${m.slug}`}
              className="group block max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={m.cardImage}
                  alt={m.name}
                  className="w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-center">
                    <p className="font-heading text-2xl md:text-3xl tracking-wide uppercase text-white">
                      {m.name}
                    </p>
                    {m.subtitle && (
                      <p className="text-white/70 text-sm tracking-widest uppercase mt-2">
                        {m.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Roster */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-12">
        {roster.map((m) => (
          <ModelCard key={m.slug} model={m} />
        ))}
      </div>
    </section>
  );
}

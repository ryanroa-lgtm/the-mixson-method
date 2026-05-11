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

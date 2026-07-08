import Link from "next/link";
import { getModelsByCategory } from "@/data/models";
import { ModelCard } from "@/components/model-card";

// Explicit roster order (3-col grid fills left-to-right):
// Row 1: Luis, Ellis, Logan · Row 2: John L., Seif, Andrew · Row 3: John W.
const ROSTER_ORDER = [
  "luis",
  "ellis",
  "logan",
  "john-l",
  "seif-asi",
  "andrew",
  "john-w",
];

export default function MenPage() {
  const men = getModelsByCategory("men");
  const featured = men.filter((m) => m.featured);
  const roster = men
    .filter((m) => !m.featured)
    .sort((a, b) => {
      const ai = ROSTER_ORDER.indexOf(a.slug);
      const bi = ROSTER_ORDER.indexOf(b.slug);
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    });

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-16 text-center">
        Men
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
              href={`/men/${m.slug}`}
              className="group block max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={m.cardImage}
                  alt={m.name}
                  className="w-full transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {!m.cardImage.endsWith(".png") && (
                <p className="font-heading text-xl tracking-widest text-center uppercase group-hover:text-muted transition-colors">
                  {m.name}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Roster */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {roster.map((m) => (
          <ModelCard key={m.slug} model={m} />
        ))}
      </div>
    </section>
  );
}

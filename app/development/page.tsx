import { getModelsByCategory } from "@/data/models";
import { ModelCard } from "@/components/model-card";

export default function DevelopmentPage() {
  const models = getModelsByCategory("development");

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-6 text-center">
        Development
      </h1>

      <p className="text-center text-muted text-base mb-16 max-w-2xl mx-auto leading-relaxed">
        The Development Division features emerging talent currently in active
        preparation for full representation. These individuals are refining
        their portfolios, strengthening their skills, or transitioning into
        markets where bookings are viable. This division reflects potential
        being intentionally shaped for long-term success.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {models.map((m) => (
          <ModelCard key={m.slug} model={m} />
        ))}
      </div>
    </section>
  );
}

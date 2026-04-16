import { getModelsByCategory } from "@/data/models";
import { ModelCard } from "@/components/model-card";

export default function MenPage() {
  const men = getModelsByCategory("men");

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-16 text-center">
        Men
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {men.map((m) => (
          <ModelCard key={m.slug} model={m} />
        ))}
      </div>
    </section>
  );
}

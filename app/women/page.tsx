import { getModelsByCategory } from "@/data/models";
import { ModelCard } from "@/components/model-card";

export default function WomenPage() {
  const women = getModelsByCategory("women");

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-16 text-center">
        Women
      </h1>

      <div className="grid grid-cols-2 gap-x-6 gap-y-12">
        {women.map((m) => (
          <ModelCard key={m.slug} model={m} />
        ))}
      </div>
    </section>
  );
}

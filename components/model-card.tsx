"use client";

import type { Model } from "@/data/models";
import { usePageTransition } from "@/components/transition-provider";

export function ModelCard({ model }: { model: Model }) {
  const { navigateTo } = usePageTransition();

  return (
    <a
      href={`/${model.category}/${model.slug}`}
      onClick={(e) => {
        e.preventDefault();
        navigateTo(`/${model.category}/${model.slug}`);
      }}
      className="group block"
    >
      {/* Placeholder image */}
      <div className="aspect-[3/4] w-full bg-neutral-200 mb-4 overflow-hidden">
        {model.cardImage && (
          <img
            src={model.cardImage}
            alt={model.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <p className="font-heading text-lg tracking-wide text-center uppercase group-hover:text-muted transition-colors">
        {model.name}
      </p>
    </a>
  );
}

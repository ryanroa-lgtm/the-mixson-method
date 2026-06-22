"use client";

import type { Model } from "@/data/models";
import { usePageTransition } from "@/components/transition-provider";

export function ModelCard({ model }: { model: Model }) {
  const { navigateTo } = usePageTransition();

  // First name only, but keep a trailing last initial (e.g. "John L.")
  const [first, second] = model.name.split(" ");
  const displayName =
    second && /^[A-Z]\.?$/.test(second) ? `${first} ${second}` : first;

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
      <div className="w-full mb-4 overflow-hidden">
        {model.cardImage && (
          <img
            src={model.cardImage}
            alt={model.name}
            className="w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      {!model.cardImage.endsWith(".png") && (
        <p className="font-heading text-lg tracking-wide text-center uppercase group-hover:text-muted transition-colors">
          {displayName}
        </p>
      )}
    </a>
  );
}

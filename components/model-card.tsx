"use client";

import type { Model } from "@/data/models";
import { usePageTransition } from "@/components/transition-provider";

export function ModelCard({ model }: { model: Model }) {
  const { navigateTo } = usePageTransition();

  // Women show full names; men show first name only, keeping a trailing
  // last initial when present (e.g. "John L.").
  const [first, second] = model.name.split(" ");
  const displayName =
    model.category === "women"
      ? model.name
      : second && /^[A-Z]\.?$/.test(second)
        ? `${first} ${second}`
        : first;

  // Development source photos have inconsistent aspect ratios, so pin their
  // cards to the same 5:7 portrait crop the men's roster uses for a uniform grid.
  const uniformCrop = model.category === "development";

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
      <div
        className={`w-full mb-4 overflow-hidden${uniformCrop ? " aspect-[5/7]" : ""}`}
      >
        {model.cardImage && (
          <img
            src={model.cardImage}
            alt={model.name}
            className={`w-full transition-transform duration-500 group-hover:scale-105${
              uniformCrop ? " h-full object-cover object-top" : ""
            }`}
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

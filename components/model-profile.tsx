import Link from "next/link";
import type { Model } from "@/data/models";

export function ModelProfile({ model }: { model: Model }) {
  return (
    <article className="mx-auto max-w-6xl px-6 py-24 stagger">
      {/* Back link */}
      <Link
        href={`/${model.category}`}
        className="text-sm uppercase tracking-widest text-muted hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to {model.category}
      </Link>

      {/* Hero */}
      <div className="w-full mb-12 overflow-hidden">
        {model.heroImage && (
          <img
            src={model.heroImage}
            alt={model.name}
            className="w-full max-h-[80vh] object-contain"
          />
        )}
      </div>

      {/* Name */}
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-12">
        {model.name}
      </h1>

      {/* Stats */}
      {model.stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8 border-t border-b border-border py-8 mb-16">
          {model.stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs uppercase tracking-widest text-muted mb-1">
                {s.label}
              </p>
              <p className="text-base">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Photos */}
      {model.gallery.length > 0 && (
        <section className="mb-16">
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-8">
            Photos
          </h2>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {model.gallery.map((src, i) =>
              src ? (
                <img
                  key={i}
                  src={src}
                  alt={`${model.name} photo ${i + 1}`}
                  className="w-full"
                />
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Digitals */}
      {(model.digitals.length > 0 || model.videos.length > 0) && (
        <section className="mb-16">
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-8">
            Digitals
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {model.digitals.map((src, i) =>
              src ? (
                <div key={i} className="aspect-[3/4] overflow-hidden">
                  <img
                    src={src}
                    alt={`${model.name} digital ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ) : null
            )}
          </div>
          {model.videos.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {model.videos.map((src, i) => (
                <video
                  key={i}
                  src={src}
                  controls
                  playsInline
                  className="w-full"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Polaroids */}
      {model.polaroids.length > 0 && (
        <section className="mb-16">
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-8">
            Polaroids
          </h2>
          <div className="columns-3 md:columns-4 gap-4 space-y-4">
            {model.polaroids.map((src, i) =>
              src ? (
                <img
                  key={i}
                  src={src}
                  alt={`${model.name} polaroid ${i + 1}`}
                  className="w-full"
                />
              ) : null
            )}
          </div>
        </section>
      )}
    </article>
  );
}

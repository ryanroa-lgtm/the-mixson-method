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
      {model.featured ? (
        <div className="relative w-full mb-12 overflow-hidden">
          <img
            src={model.heroImage}
            alt={model.name}
            className="w-full max-h-[85vh] object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-12">
            <div className="text-center">
              <h1 className="font-heading text-4xl md:text-6xl tracking-wide uppercase text-white mb-3">
                {model.name}
              </h1>
              {model.subtitle && (
                <p className="text-white/70 text-sm md:text-base tracking-widest uppercase">
                  {model.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mb-12 overflow-hidden">
          {model.heroImage && (
            <img
              src={model.heroImage}
              alt={model.name}
              className="w-full max-h-[80vh] object-contain"
            />
          )}
        </div>
      )}

      {/* Name (non-featured only — featured has it on the hero) */}
      {!model.featured && (
        <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-12">
          {model.name}
        </h1>
      )}

      {/* Bio (featured only) */}
      {model.bio && (
        <section className="mb-16 max-w-3xl">
          <div className="space-y-4 text-base leading-relaxed text-muted">
            {model.bio.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

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
            Portfolio
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

      {/* Booking CTA (featured only) */}
      {model.bookingUrl && (
        <section className="mb-16 text-center border-t border-border pt-16">
          <a
            href={model.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-foreground text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors mb-8"
          >
            Book {model.name.split(" ")[0]}
          </a>
          <div className="flex items-center justify-center gap-8 text-sm text-muted">
            <a
              href="mailto:themixsonmethod@gmail.com"
              className="hover:text-foreground transition-colors"
            >
              themixsonmethod@gmail.com
            </a>
            <a
              href="https://www.instagram.com/themixsonmethod/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              @themixsonmethod
            </a>
            <a
              href="https://www.instagram.com/chancegwyen/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              @chancegwyen
            </a>
          </div>
        </section>
      )}
    </article>
  );
}

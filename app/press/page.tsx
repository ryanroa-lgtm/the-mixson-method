// Press coverage, ordered so the editorial features carry the page. Outlets in
// `featuredOutlets` get logos and a gallery; the syndicated and
// press-release-distribution outlets are listed as text further down.
//
// `model`, `date` and `href` are left undefined wherever the detail hasn't been
// supplied yet — the caption renders whatever it has, so filling these in later
// is a data edit and nothing more.
type Feature = {
  src: string;
  model?: string;
  date?: string;
  href?: string;
};

type Outlet = {
  name: string;
  logo?: string;
  features: Feature[];
};

const featuredOutlets: Outlet[] = [
  {
    name: "Elle China",
    logo: "/press/logos/elle-china.svg",
    features: [
      { src: "/press/features/elle-china-1.jpg" },
      { src: "/press/features/elle-china-2.jpg" },
      { src: "/press/features/elle-china-3.jpg" },
      { src: "/press/features/elle-china-4.jpg" },
    ],
  },
  {
    name: "Cosmopolitan Japan",
    logo: "/press/logos/cosmopolitan-japan.svg",
    features: [{ src: "/press/features/cosmopolitan-japan-1.jpg" }],
  },
  {
    name: "FOX 21",
    logo: "/press/logos/fox-21.svg",
    features: [
      { src: "/press/features/fox-21-1.jpg" },
      { src: "/press/features/fox-21-2.jpg" },
    ],
  },
  {
    name: "Getty Images",
    // No official mark on file yet — the tile falls back to the name set in
    // the heading face until a logo is added.
    features: [
      { src: "/press/features/getty-images-1.jpg" },
      { src: "/press/features/getty-images-2.jpg" },
    ],
  },
];

const additionalCoverage: { name: string; href?: string }[] = [
  { name: "US National Times" },
  { name: "American Times Reporter" },
  { name: "Florida Culture Times" },
  // Not named in the brief. It was in the old gallery and sits in the same
  // tier as the others, so it is listed here rather than dropped outright.
  { name: "Gossip Stone" },
];

function caption(outlet: string, f: Feature) {
  return [outlet, f.model, f.date].filter(Boolean).join(" · ");
}

export default function PressPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-16 text-center">
        Press &amp; Media
      </h1>

      {/* As Seen In */}
      <div className="mb-24">
        <h2 className="font-heading text-2xl tracking-wide uppercase mb-10 text-center text-muted">
          As Seen In
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {featuredOutlets.map((outlet) => (
            <div
              key={outlet.name}
              className="flex h-24 w-48 items-center justify-center border border-border p-5"
            >
              {outlet.logo ? (
                <img
                  src={outlet.logo}
                  alt={outlet.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="font-heading text-base tracking-widest uppercase text-center">
                  {outlet.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured coverage, grouped by outlet */}
      <div className="space-y-20">
        {featuredOutlets.map((outlet) => (
          <div key={outlet.name}>
            <h2 className="font-heading text-xl tracking-widest uppercase mb-8 pb-3 border-b border-border">
              {outlet.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {outlet.features.map((f) => {
                const text = caption(outlet.name, f);
                return (
                  <figure key={f.src}>
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-50">
                      <img
                        src={f.src}
                        alt={`${outlet.name} feature`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <figcaption className="mt-3 text-xs uppercase tracking-widest text-muted">
                      {f.href ? (
                        <a
                          href={f.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 decoration-border hover:decoration-foreground hover:text-foreground transition-colors"
                        >
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Additional coverage */}
      <div className="mt-24 pt-10 border-t border-border">
        <h2 className="font-heading text-sm tracking-widest uppercase mb-5 text-muted">
          Additional Coverage
        </h2>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {additionalCoverage.map((item) => (
            <li key={item.name}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 decoration-border hover:decoration-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                item.name
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Press inquiries */}
      <p className="mt-16 text-center text-sm text-muted">
        Press inquiries:{" "}
        <a
          href="mailto:themixsonmethod@gmail.com"
          className="underline underline-offset-4 decoration-border hover:decoration-foreground hover:text-foreground transition-colors"
        >
          themixsonmethod@gmail.com
        </a>
      </p>
    </section>
  );
}

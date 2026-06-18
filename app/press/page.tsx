import { PressSlideshow } from "@/components/press-slideshow";

const logos = [
  { src: "/press/logos/elle-china.svg", alt: "Elle China" },
  { src: "/press/logos/cosmopolitan-japan.svg", alt: "Cosmopolitan Japan" },
  { src: "/press/logos/us-national-times.svg", alt: "US National Times" },
  { src: "/press/logos/american-times-reporter.svg", alt: "American Times Reporter" },
  { src: "/press/logos/fox-21.svg", alt: "FOX 21" },
  { src: "/press/logos/florida-culture-times.svg", alt: "Florida Culture Times" },
  { src: "/press/logos/ein-presswire.svg", alt: "EIN Presswire" },
];

// Interleaved round-robin so no two images from the same publication are
// adjacent (including across the loop seam from last back to first).
const features = [
  { src: "/press/features/elle-china-1.jpg", alt: "Elle China feature" },
  { src: "/press/features/gossip-stone-1.jpg", alt: "Gossip Stone feature" },
  { src: "/press/features/getty-images-1.jpg", alt: "Getty Images feature" },
  { src: "/press/features/us-national-times-1.jpg", alt: "US National Times feature" },
  { src: "/press/features/american-times-reporter-1.jpg", alt: "American Times Reporter feature" },
  { src: "/press/features/elle-china-2.jpg", alt: "Elle China feature" },
  { src: "/press/features/fox-21-1.jpg", alt: "FOX 21 feature" },
  { src: "/press/features/florida-culture-times-1.jpg", alt: "Florida Culture Times feature" },
  { src: "/press/features/cosmopolitan-japan-1.jpg", alt: "Cosmopolitan Japan feature" },
  { src: "/press/features/gossip-stone-2.jpg", alt: "Gossip Stone feature" },
  { src: "/press/features/elle-china-3.jpg", alt: "Elle China feature" },
  { src: "/press/features/getty-images-2.jpg", alt: "Getty Images feature" },
  { src: "/press/features/us-national-times-2.jpg", alt: "US National Times feature" },
  { src: "/press/features/american-times-reporter-2.jpg", alt: "American Times Reporter feature" },
  { src: "/press/features/fox-21-2.jpg", alt: "FOX 21 feature" },
  { src: "/press/features/elle-china-4.jpg", alt: "Elle China feature" },
  { src: "/press/features/florida-culture-times-2.jpg", alt: "Florida Culture Times feature" },
  { src: "/press/features/gossip-stone-3.jpg", alt: "Gossip Stone feature" },
];

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
        <div className="flex flex-wrap justify-center gap-4">
          {logos.map((logo) => (
            <div
              key={logo.src}
              className="flex h-20 w-40 items-center justify-center border border-border p-4"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Featured coverage */}
      <PressSlideshow images={features} />
    </section>
  );
}

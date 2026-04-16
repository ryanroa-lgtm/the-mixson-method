export default function Home() {
  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center">
      {/* Hero background video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="/hero/2026-04-16-113024286.mp4"
        />
      </div>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center px-6">
        <h1 className="font-heading text-5xl md:text-7xl tracking-wide uppercase mb-6 text-white">
          The Mixson Method
        </h1>
        <p className="text-white/70 text-lg md:text-xl tracking-widest uppercase font-body">
          Intention. Discipline. Direction.
        </p>
      </div>
    </section>
  );
}

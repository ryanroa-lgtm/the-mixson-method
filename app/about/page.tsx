export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-12 text-center">
        About
      </h1>

      <div className="space-y-8 text-base leading-relaxed text-muted font-body">
        <p>
          The Mixson Method is a boutique agency shaped by intention, discipline,
          and a curated eye. We work quietly, selectively, and with
          purpose&mdash;building talent through clarity rather than noise.
        </p>

        <p>
          We don&rsquo;t rush development. We study potential, refine direction,
          and build portfolios that speak before we do. Every model receives
          structured guidance rooted in creative direction, editorial
          sensibility, and a long-view understanding of where they can grow.
        </p>

        <div>
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-4 text-foreground">
            What We Do
          </h2>
          <ul className="list-none space-y-2">
            <li>Talent development and representation.</li>
            <li>Editorial and commercial portfolio building.</li>
            <li>Creative direction for campaigns and brand partnerships.</li>
            <li>Strategic guidance for emerging and established talent.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-4 text-foreground">
            Our Vision
          </h2>
          <p>
            We&rsquo;re expanding with intention&mdash;partnering with talent
            and brands who value authenticity, discipline, and elevated
            storytelling. The Mixson Method moves quietly, but always with
            direction.
          </p>
        </div>
      </div>
    </section>
  );
}

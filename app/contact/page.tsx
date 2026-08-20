import { ContactForm } from "./contact-form";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Populated by the "Book <talent>" buttons on model profiles.
  const { subject, talent } = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-12 text-center">
        Contact
      </h1>

      <ContactForm
        initialSubject={first(subject) ?? ""}
        initialTalent={first(talent) ?? ""}
      />
    </section>
  );
}

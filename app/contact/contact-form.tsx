"use client";

import { useState, type FormEvent } from "react";

const subjects = [
  "General Inquiry",
  "Booking",
  "Group / Multiple Talent",
  "Casting Inquiry",
] as const;

export function ContactForm({
  initialSubject = "",
  initialTalent = "",
}: {
  initialSubject?: string;
  initialTalent?: string;
}) {
  // Pre-filled when arriving from a "Book <talent>" button on a profile.
  const [subject, setSubject] = useState(() =>
    (subjects as readonly string[]).includes(initialSubject)
      ? initialSubject
      : ""
  );
  const [talent, setTalent] = useState(initialTalent);

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject,
      talent,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
      setSubject("");
      setTalent("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-xs uppercase tracking-widest text-muted mb-2"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-muted mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-xs uppercase tracking-widest text-muted mb-2"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="">Select&hellip;</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="talent"
            className="block text-xs uppercase tracking-widest text-muted mb-2"
          >
            Talent <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="talent"
            name="talent"
            type="text"
            value={talent}
            onChange={(e) => setTalent(e.target.value)}
            placeholder="Separate multiple names with commas"
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-xs uppercase tracking-widest text-muted mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-center text-muted">
            Thank you. We&rsquo;ll be in touch.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-center text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </form>

      <p className="mt-12 text-center text-sm text-muted">
        <a
          href="mailto:themixsonmethod@gmail.com"
          className="hover:text-foreground transition-colors"
        >
          themixsonmethod@gmail.com
        </a>
      </p>
    </>
  );
}

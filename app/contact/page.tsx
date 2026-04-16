"use client";

import { useState, type FormEvent } from "react";

const subjects = ["General Inquiry", "Booking", "Casting Inquiry"] as const;

export default function ContactPage() {
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
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
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
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-12 text-center">
        Contact
      </h1>

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
          {status === "sending" ? "Sending\u2026" : "Send Message"}
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
    </section>
  );
}

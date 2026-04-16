"use client";

import { useState, type FormEvent } from "react";

const genders = ["Male", "Female"] as const;

const photoLabels = [
  "Front / Headshot",
  "Side Profile",
  "Full Body",
  "Additional (Optional)",
];

export default function SubmissionsPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [previews, setPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  function handleFileChange(index: number, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviews((prev) => {
        const next = [...prev];
        next[index] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
      setPreviews([null, null, null, null]);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-6 text-center">
        Submissions
      </h1>

      <p className="text-center text-muted text-base mb-12 max-w-xl mx-auto leading-relaxed">
        We&rsquo;re always looking for new faces. If you think you have what it
        takes, submit your details below.
      </p>

      {/* Height Requirements */}
      <div className="grid grid-cols-2 gap-6 mb-16 max-w-md mx-auto">
        <div className="border border-border py-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">
            Men
          </p>
          <p className="font-heading text-lg">5&rsquo;11&rdquo; &ndash; 6&rsquo;7&rdquo;</p>
        </div>
        <div className="border border-border py-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">
            Women
          </p>
          <p className="font-heading text-lg">5&rsquo;8&rdquo; &ndash; 6&rsquo;0&rdquo;</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Name *
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
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        {/* Phone & Instagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="instagram"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Instagram *
            </label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              required
              placeholder="@"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        {/* City/State & Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="location"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              City / State *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="height"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Height *
            </label>
            <input
              id="height"
              name="height"
              type="text"
              required
              placeholder="e.g. 5'10&quot;"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        {/* Gender & Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="gender"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="w-full border border-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-foreground transition-colors"
            >
              <option value="">Select&hellip;</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="portfolio"
              className="block text-xs uppercase tracking-widest text-muted mb-2"
            >
              Portfolio Link
            </label>
            <input
              id="portfolio"
              name="portfolio"
              type="url"
              placeholder="https://"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        {/* Photo Uploads */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-4">
            Photos *
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photoLabels.map((label, i) => (
              <label
                key={label}
                className="group cursor-pointer block"
              >
                <div className="aspect-[3/4] border border-border flex items-center justify-center overflow-hidden bg-neutral-50 hover:bg-neutral-100 transition-colors relative">
                  {previews[i] ? (
                    <img
                      src={previews[i]!}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center px-2">
                      <svg
                        className="mx-auto mb-2 text-muted"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 16v-8m-4 4h8" strokeLinecap="round" />
                      </svg>
                      <span className="text-[10px] uppercase tracking-widest text-muted">
                        Upload
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted text-center mt-2">
                  {label}
                </p>
                <input
                  type="file"
                  name={`photo-${i}`}
                  accept="image/*"
                  required={i < 3}
                  className="sr-only"
                  onChange={(e) =>
                    handleFileChange(i, e.target.files?.[0] ?? null)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {status === "sending" ? "Submitting\u2026" : "Submit"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-center text-muted">
            Thank you for your submission. We&rsquo;ll review and be in touch.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-center text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}

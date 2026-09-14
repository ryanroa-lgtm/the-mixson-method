"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

type ExperienceLevel = "" | "new-face" | "some-experience" | "experienced";

const photoLabels = ["Front", "Side", "Full Body", "Profile"];

const modelingTypes = [
  "Fitness",
  "Lifestyle",
  "Editorial",
  "Commercial",
  "Runway",
];

const castingAvailability = [
  "Weekdays",
  "Weekends",
  "Evenings",
  "Flexible / Open",
];

// Anything that can go wrong here — a format the browser can't decode (HEIC
// off an iPhone, in a non-Safari browser), a corrupt file, a canvas that
// refuses to encode — falls back to the original file. It must never leave
// the promise pending, or the submit handler stalls on "Submitting…" forever.
function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.7
): Promise<Blob> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    let settled = false;

    const done = (blob: Blob) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(blob);
    };

    const timer = setTimeout(() => done(file), 15000);

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(file);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => done(blob ?? file), "image/jpeg", quality);
      } catch {
        done(file);
      }
    };
    img.onerror = () => done(file);
    img.src = url;
  });
}

// ── Reusable field components ──

const inputClass =
  "w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors";
const labelClass = "block text-xs uppercase tracking-widest text-muted mb-2";
const sectionClass = "border-t border-border pt-10";

function TextField({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && " *"}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  required = false,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && " *"}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        onChange={onChange}
        className={`${inputClass} bg-white`}
      >
        <option value="">Select&hellip;</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function YesNoField({ id, label }: { id: string; label: string }) {
  return (
    <SelectField id={id} label={label} options={["Yes", "No"]} required />
  );
}

function TextAreaField({
  id,
  label,
  required = false,
  rows = 3,
}: {
  id: string;
  label: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && " *"}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

function CheckboxGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-4 mt-1">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={o}
              className="accent-foreground"
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Page ──

export default function SubmissionsPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [experience, setExperience] = useState<ExperienceLevel>("");
  const [previews, setPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [compCardPreview, setCompCardPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const filesRef = useRef<(File | null)[]>([null, null, null, null]);
  const compCardRef = useRef<File | null>(null);

  function handleFileChange(index: number, file: File | null) {
    if (!file) return;
    filesRef.current[index] = file;
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

  function handleCompCard(file: File | null) {
    if (!file) return;
    compCardRef.current = file;
    const reader = new FileReader();
    reader.onload = () => setCompCardPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // The file inputs are visually hidden, so a native `required` on them
    // blocks submission with a validation bubble nobody can see. Check them
    // here instead and say plainly what is missing.
    const missing = photoLabels.filter((_, i) => !filesRef.current[i]);
    if (experience === "experienced" && !compCardRef.current) {
      missing.push("Comp Card");
    }
    if (missing.length > 0) {
      setStatus("error");
      setErrorMsg(
        `Please add the following before submitting: ${missing.join(", ")}.`
      );
      return;
    }

    setStatus("sending");
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData();

    // Gather all text/select/textarea/checkbox fields
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      if (!el.name || el.type === "file" || el.type === "submit") continue;
      if (el.type === "checkbox") {
        if ((el as HTMLInputElement).checked) {
          formData.append(el.name, el.value);
        }
      } else {
        formData.append(el.name, el.value);
      }
    }

    // Compress and add digitals
    for (let i = 0; i < 4; i++) {
      const file = filesRef.current[i];
      if (file) {
        const compressed = await compressImage(file);
        formData.append(`photo-${i}`, compressed, `${photoLabels[i]}.jpg`);
      }
    }

    // Add comp card if present
    if (compCardRef.current) {
      const compressed = await compressImage(compCardRef.current);
      formData.append("comp-card", compressed, "comp-card.jpg");
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d?.error as string | undefined)
          .catch(() => undefined);
        throw new Error(
          detail || `The server rejected the submission (${res.status}).`
        );
      }
      setStatus("sent");
      setErrorMsg(null);
      form.reset();
      setExperience("");
      setPreviews([null, null, null, null]);
      setCompCardPreview(null);
      filesRef.current = [null, null, null, null];
      compCardRef.current = null;
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
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
          <p className="font-heading text-lg">
            5&rsquo;11&rdquo; &ndash; 6&rsquo;7&rdquo;
          </p>
        </div>
        <div className="border border-border py-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">
            Women
          </p>
          <p className="font-heading text-lg">
            5&rsquo;8&rdquo; &ndash; 6&rsquo;0&rdquo;
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ── 1. Core Info ── */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="name" label="Full Name" required />
            <TextField id="age" label="Age" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="location" label="City & State" required />
            <TextField id="email" label="Email" type="email" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="phone" label="Phone" type="tel" required />
            <TextField
              id="instagram"
              label="Instagram Handle (must be public)"
              required
              placeholder="@"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              id="height"
              label="Height"
              required
              placeholder="e.g. 5'10&quot;"
            />
            <TextField id="chest-bust" label="Chest / Bust" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="waist" label="Waist" required />
            <TextField id="hips" label="Hips" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="inseam" label="Inseam" required />
            <TextField id="shoe-size" label="Shoe Size" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField id="hair-color" label="Hair Color" required />
            <TextField id="eye-color" label="Eye Color" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YesNoField id="tattoos" label="Visible Tattoos" />
            <TextField
              id="tattoo-placement"
              label="If yes, placement"
              placeholder="e.g. left forearm, right shoulder"
            />
          </div>
          <TextField
            id="portfolio"
            label="Portfolio Link (Instagram or Website)"
            type="url"
            placeholder="https://"
          />
        </div>

        {/* ── Digitals Upload ── */}
        <div>
          <p className={`${labelClass} mb-4`}>Upload Digitals *</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photoLabels.map((label, i) => (
              <label key={label} className="group cursor-pointer block">
                <div className="aspect-[3/4] border border-border flex items-center justify-center overflow-hidden bg-neutral-50 hover:bg-neutral-100 transition-colors">
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
                        <path
                          d="M12 16v-8m-4 4h8"
                          strokeLinecap="round"
                        />
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
                  className="sr-only"
                  onChange={(e) =>
                    handleFileChange(i, e.target.files?.[0] ?? null)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* ── 2. Experience Level ── */}
        <div className={sectionClass}>
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-6">
            Experience Level
          </h2>
          <SelectField
            id="experience"
            label="Select your experience level"
            required
            options={[
              "I am a new face (no professional experience yet)",
              "I have some experience (local shoots, small shows, collaborations)",
              "I am experienced (previously signed, paid work, runway)",
            ]}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith("I am a new"))
                setExperience("new-face");
              else if (val.startsWith("I have some"))
                setExperience("some-experience");
              else if (val.startsWith("I am experienced"))
                setExperience("experienced");
              else setExperience("");
            }}
          />
        </div>

        {/* ── 3. New Face Fields ── */}
        {experience === "new-face" && (
          <div className={`${sectionClass} space-y-6`}>
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
              New Face
            </h2>
            <YesNoField
              id="posing-classes"
              label="Have you taken any posing or runway classes?"
            />
            <YesNoField
              id="open-to-development"
              label="Are you open to development, coaching, and agency guidance?"
            />
            <CheckboxGroup
              name="casting-availability"
              label="Are you available for castings, test shoots, and training?"
              options={castingAvailability}
            />
            <CheckboxGroup
              name="modeling-interest"
              label="What type of modeling are you interested in?"
              options={modelingTypes}
            />
            <TextAreaField
              id="why-mixson"
              label="Why do you want to be represented by The Mixson Method?"
              required
              rows={4}
            />
          </div>
        )}

        {/* ── 4. Some Experience Fields ── */}
        {experience === "some-experience" && (
          <div className={`${sectionClass} space-y-6`}>
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
              Your Experience
            </h2>
            <TextAreaField
              id="past-work"
              label="List any photographers, brands, or creatives you've worked with"
              required
            />
            <YesNoField
              id="runway-shows"
              label="Have you walked in any runway shows?"
            />
            <TextAreaField
              id="runway-details"
              label="If yes, list shows, designers, or producers"
            />
            <YesNoField
              id="paid-work"
              label="Have you been paid for modeling work?"
            />
            <YesNoField
              id="posing-training"
              label="Have you taken posing or runway training?"
            />
            <YesNoField
              id="currently-represented"
              label="Are you currently represented?"
            />
          </div>
        )}

        {/* ── 5. Experienced Fields ── */}
        {experience === "experienced" && (
          <div className={`${sectionClass} space-y-6`}>
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
              Professional Background
            </h2>
            <TextAreaField
              id="agencies"
              label="Current or previous agencies"
              required
            />
            <TextAreaField
              id="runway-history"
              label="List runway shows, designers, or producers"
              required
            />
            <TextAreaField
              id="campaign-work"
              label="List commercial, editorial, or campaign work"
              required
            />
            <SelectField
              id="representation-type"
              label="What type of representation are you seeking?"
              required
              options={[
                "Mother agency representation",
                "Placement",
                "Non-exclusive representation",
              ]}
            />
            <SelectField
              id="travel-willingness"
              label="Are you willing to travel for bookings?"
              required
              options={["Local", "Regional", "National", "International"]}
            />
            {/* Comp card upload */}
            <div>
              <p className={`${labelClass} mb-2`}>Upload Comp Card *</p>
              <label className="group cursor-pointer block w-48">
                <div className="aspect-[3/4] border border-border flex items-center justify-center overflow-hidden bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  {compCardPreview ? (
                    <img
                      src={compCardPreview}
                      alt="Comp Card"
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
                        <path
                          d="M12 16v-8m-4 4h8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-[10px] uppercase tracking-widest text-muted">
                        Upload
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted text-center mt-2">
                  Comp Card
                </p>
                <input
                  type="file"
                  name="comp-card"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    handleCompCard(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
          </div>
        )}

        {/* ── 6. Professionalism & Readiness ── */}
        {experience && (
          <div className={`${sectionClass} space-y-6`}>
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
              Professionalism &amp; Readiness
            </h2>
            <YesNoField
              id="professional-instagram"
              label="Do you maintain a public, professional Instagram?"
            />
            <YesNoField
              id="agency-guidelines"
              label="Are you willing to follow agency guidelines for communication, posting, and professionalism?"
            />
            <YesNoField
              id="no-pay-to-play"
              label="Do you understand that The Mixson Method does not participate in pay-to-walk or pay-to-play shows?"
            />
            <YesNoField
              id="attend-scheduled"
              label="Are you willing to attend castings, fittings, and shoots as scheduled?"
            />
          </div>
        )}

        {/* ── 7. Optional Questions ── */}
        {experience && (
          <div className={`${sectionClass} space-y-6`}>
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
              Optional
            </h2>
            <TextAreaField
              id="dream-brands"
              label="What brands or campaigns do you see yourself working with?"
            />
            <TextAreaField
              id="goals-12-months"
              label="What are your goals in the next 12 months?"
            />
            <TextAreaField
              id="upcoming-travel"
              label="Do you have any upcoming travel that may affect availability?"
            />
          </div>
        )}

        {/* ── Submit ── */}
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
            {errorMsg || "Something went wrong. Please try again."}
          </p>
        )}
      </form>
    </section>
  );
}

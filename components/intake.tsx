"use client";

// Shared building blocks for the two intake forms (/submissions and
// /collaborate). Files never pass through our own server: each one uploads
// straight from the browser to the private Blob store, and the form then posts
// the text fields plus the stored pathnames as JSON.

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";

// ── Styles ──

export const inputClass =
  "w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors";
export const labelClass =
  "block text-xs uppercase tracking-widest text-muted mb-2";
export const sectionClass = "border-t border-border pt-10";
const helperClass = "text-xs text-muted mt-2 leading-relaxed";

export const AGE_MESSAGE = "Applicants must be 18 or older.";

// ── Upload rules (mirrored on the server in lib/intake.ts) ──

export type FileKind = "image" | "video";

const IMAGE_EXT = ["jpg", "jpeg", "png", "heic", "heif"];
const VIDEO_EXT = ["mp4", "mov"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 60;

const ACCEPT: Record<FileKind, string> = {
  image: "image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif",
  video: "video/mp4,video/quicktime,.mp4,.mov",
};

function extOf(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

// Browsers other than Safari often report HEIC with an empty type, so the
// extension is the fallback for both the check and the upload content type.
function contentTypeOf(file: File, kind: FileKind) {
  if (file.type) return file.type;
  const ext = extOf(file);
  if (kind === "video") return ext === "mov" ? "video/quicktime" : "video/mp4";
  if (ext === "png") return "image/png";
  if (ext === "heic" || ext === "heif") return `image/${ext}`;
  return "image/jpeg";
}

// Resolves to the duration in seconds, or null when the browser can't read it
// (a HEVC .mov in Chrome, say). Unknown durations fall back to the size cap.
function videoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    const finish = (d: number | null) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(d);
    };
    const timer = setTimeout(() => finish(null), 8000);
    v.preload = "metadata";
    v.onloadedmetadata = () =>
      finish(Number.isFinite(v.duration) ? v.duration : null);
    v.onerror = () => finish(null);
    v.src = url;
  });
}

async function checkFile(file: File, kind: FileKind): Promise<string | null> {
  const allowed = kind === "image" ? IMAGE_EXT : VIDEO_EXT;
  if (!allowed.includes(extOf(file))) {
    return kind === "image"
      ? "Please use a JPG, PNG or HEIC image."
      : "Please use an MP4 or MOV video.";
  }
  if (kind === "image" && file.size > MAX_IMAGE_BYTES) {
    return "Images must be 10 MB or smaller.";
  }
  if (kind === "video") {
    if (file.size > MAX_VIDEO_BYTES) return "Videos must be 100 MB or smaller.";
    const d = await videoDuration(file);
    if (d !== null && d > MAX_VIDEO_SECONDS + 0.5) {
      return "Videos must be 60 seconds or shorter.";
    }
  }
  return null;
}

// ── Picked files ──

export type PickedFile = {
  slot: string; // stable key, also used in the stored filename
  label: string; // human label for the email and review page
  kind: FileKind;
  file: File;
};

export type StoredFile = {
  slot: string;
  label: string;
  pathname: string;
  contentType: string;
  size: number;
};

export function newSubmissionId() {
  return crypto.randomUUID();
}

export async function uploadAll(
  prefix: "talent" | "collab",
  id: string,
  files: PickedFile[],
  onProgress: (done: number, total: number) => void
): Promise<StoredFile[]> {
  const stored: StoredFile[] = [];
  onProgress(0, files.length);
  for (const [i, f] of files.entries()) {
    const contentType = contentTypeOf(f.file, f.kind);
    const pathname = `${prefix}/${id}/${f.slot}.${extOf(f.file)}`;
    const blob = await upload(pathname, f.file, {
      access: "private",
      handleUploadUrl: "/api/upload",
      contentType,
      multipart: f.file.size > 8 * 1024 * 1024,
    });
    stored.push({
      slot: f.slot,
      label: f.label,
      pathname: blob.pathname,
      contentType,
      size: f.file.size,
    });
    onProgress(i + 1, files.length);
  }
  return stored;
}

// ── Collecting field values ──

export type Entry = {
  name: string;
  label: string;
  section: string;
  value: string;
};

// Walks the form in document order. Checkbox groups collapse into one entry
// joined by commas; unchecked single checkboxes are skipped. Labels and
// sections come from data attributes the field components set, so the email
// and review page read exactly like the form.
export function collectEntries(form: HTMLFormElement): Entry[] {
  const entries: Entry[] = [];
  const byName = new Map<string, Entry>();

  for (const el of Array.from(form.elements)) {
    if (
      !(el instanceof HTMLInputElement) &&
      !(el instanceof HTMLSelectElement) &&
      !(el instanceof HTMLTextAreaElement)
    ) {
      continue;
    }
    if (!el.name || el.type === "file" || el.dataset.honeypot) continue;
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      if (!el.checked) continue;
    }

    const value = el.value.trim();
    const existing = byName.get(el.name);
    if (existing) {
      existing.value = [existing.value, value].filter(Boolean).join(", ");
      continue;
    }
    const entry: Entry = {
      name: el.name,
      label:
        el.closest<HTMLElement>("[data-group-label]")?.dataset.groupLabel ??
        el.dataset.label ??
        el.name,
      section:
        el.closest<HTMLElement>("[data-section]")?.dataset.section ?? "",
      value,
    };
    byName.set(el.name, entry);
    entries.push(entry);
  }
  return entries;
}

// ── Validation ──

export type MissingField = { anchorId: string; label: string };

// The forms carry `noValidate` so the browser never raises its own bubble —
// file inputs are visually hidden and a native message would land somewhere
// nobody can see. Everything missing is gathered here instead, in page order,
// and shown in one dialog.
export function collectMissing(
  form: HTMLFormElement,
  extra: MissingField[] = []
): MissingField[] {
  const missing: MissingField[] = [];

  for (const el of Array.from(form.elements)) {
    if (
      !(el instanceof HTMLInputElement) &&
      !(el instanceof HTMLSelectElement) &&
      !(el instanceof HTMLTextAreaElement)
    ) {
      continue;
    }
    if (el.type === "file" || el.disabled || !el.name) continue;
    if (el.checkValidity()) continue;
    const label = el.dataset.missingLabel ?? el.dataset.label ?? el.name;
    let text = label;
    if (!el.validity.valueMissing) {
      text =
        el.name === "age" && el.validity.rangeUnderflow
          ? AGE_MESSAGE
          : `${label} — check the format`;
    }
    missing.push({ anchorId: el.id || el.name, label: text });
  }

  // Required multi-selects: at least one box in the group must be ticked.
  for (const group of Array.from(
    form.querySelectorAll<HTMLElement>("[data-required-group]")
  )) {
    if (!group.querySelector("input:checked")) {
      missing.push({
        anchorId: group.id,
        label: group.dataset.groupLabel ?? group.id,
      });
    }
  }

  // Keep dialog order matching page order.
  const order = (id: string) => {
    const node =
      document.getElementById(id) ??
      form.querySelector<HTMLElement>(`[name="${id}"]`);
    return node ? node.getBoundingClientRect().top + window.scrollY : 0;
  };
  return [...missing, ...extra].sort(
    (a, b) => order(a.anchorId) - order(b.anchorId)
  );
}

export function scrollToField(form: HTMLFormElement | null, anchorId: string) {
  // Let the dialog unmount (it locks body scroll) before scrolling.
  requestAnimationFrame(() => {
    if (!form) return;
    const target =
      document.getElementById(anchorId) ||
      form.querySelector<HTMLElement>(`[name="${anchorId}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      // preventScroll so focus doesn't fight the smooth scroll above.
      target.focus({ preventScroll: true });
    }
  });
}

// ── Page furniture ──

export function IntakeNotice() {
  return (
    <ul className="border border-border px-6 py-5 mb-12 space-y-2 text-sm leading-relaxed max-w-xl mx-auto">
      <li>No fees to submit, sign or collaborate.</li>
      <li>Applicants must be 18 or older.</li>
      <li>We review submissions in batches and will reach out if it&rsquo;s a fit.</li>
      <li className="text-muted">
        Fields marked * are required. Anything not marked is optional.
      </li>
    </ul>
  );
}

export function Section({
  title,
  children,
  first = false,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div data-section={title} className={first ? "space-y-6" : `${sectionClass} space-y-6`}>
      <h2 className="font-heading text-2xl tracking-wide uppercase mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

// Off-screen field that people never see or fill. Bots that fill every input
// trip it, and the server quietly drops the submission.
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
      <label>
        Company website
        <input
          type="text"
          name="company-website"
          data-honeypot="1"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}

// ── Fields ──

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
      {required && " *"}
    </label>
  );
}

export function TextField({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
  helper,
  min,
  max,
  inputMode,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helper?: string;
  min?: number;
  max?: number;
  inputMode?: "numeric" | "text" | "url" | "email" | "tel";
}) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        inputMode={inputMode}
        data-label={label}
        className={inputClass}
      />
      {helper && <p className={helperClass}>{helper}</p>}
    </div>
  );
}

export function SelectField({
  id,
  label,
  options,
  required = false,
  helper,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  helper?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <select
        id={id}
        name={id}
        required={required}
        data-label={label}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value)}
        className={`${inputClass} bg-white`}
      >
        <option value="">Select&hellip;</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {helper && <p className={helperClass}>{helper}</p>}
    </div>
  );
}

export function YesNoField({
  id,
  label,
  required = true,
  helper,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <SelectField
      id={id}
      label={label}
      options={["Yes", "No"]}
      required={required}
      helper={helper}
      onChange={onChange}
    />
  );
}

export function TextAreaField({
  id,
  label,
  required = false,
  rows = 3,
  helper,
}: {
  id: string;
  label: string;
  required?: boolean;
  rows?: number;
  helper?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        data-label={label}
        className={`${inputClass} resize-none`}
      />
      {helper && <p className={helperClass}>{helper}</p>}
    </div>
  );
}

export function CheckboxGroup({
  name,
  label,
  options,
  required = false,
  exclusive,
  onChange,
}: {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
  // An option that clears the others when ticked (e.g. "None of these").
  exclusive?: string;
  onChange?: (checked: string[]) => void;
}) {
  function handle(e: ChangeEvent<HTMLInputElement>) {
    const group = e.currentTarget.closest("fieldset");
    if (!group) return;
    const boxes = Array.from(
      group.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)
    );
    if (exclusive && e.currentTarget.checked) {
      for (const b of boxes) {
        const isExclusive = b.value === exclusive;
        if (e.currentTarget.value === exclusive ? !isExclusive : isExclusive) {
          b.checked = false;
        }
      }
    }
    onChange?.(boxes.filter((b) => b.checked).map((b) => b.value));
  }

  return (
    <fieldset
      id={name}
      data-group-label={label}
      data-required-group={required ? "1" : undefined}
      className="scroll-mt-24"
    >
      <legend className={labelClass}>
        {label}
        {required && " *"}
      </legend>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-1">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={o}
              onChange={handle}
              className="accent-foreground"
            />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// A single required agreement. The checkbox value is the statement itself, so
// the record shows exactly what was agreed to.
export function AgreementBox({
  id,
  text,
  short,
}: {
  id: string;
  text: string;
  short: string;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm leading-relaxed">
      <input
        id={id}
        name={id}
        type="checkbox"
        required
        value="Agreed"
        data-label={text}
        data-missing-label={`Agreement — ${short}`}
        className="accent-foreground mt-1 shrink-0"
      />
      <span>{text} *</span>
    </label>
  );
}

// ── File slots ──

function UploadIcon() {
  return (
    <svg
      className="mx-auto mb-2 text-muted"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 16v-8m-4 4h8" strokeLinecap="round" />
    </svg>
  );
}

function FileName({ file }: { file: File }) {
  return (
    <span className="px-2 text-[10px] uppercase tracking-widest text-muted break-all text-center">
      {file.name}
    </span>
  );
}

// Callers key this by file, so a new pick starts with fresh state.
function Preview({ file, kind }: { file: File; kind: FileKind }) {
  const [url, setUrl] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (kind !== "image") return;
    const reader = new FileReader();
    reader.onload = () => setUrl(reader.result as string);
    reader.onerror = () => setBroken(true);
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file, kind]);

  // Videos, and HEIC outside Safari, can't be previewed; show the name.
  if (kind === "video" || broken) return <FileName file={file} />;
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      onError={() => setBroken(true)}
      className="w-full h-full object-cover"
    />
  );
}

const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

export function FileSlot({
  id,
  label,
  kind,
  required = false,
  file,
  onPick,
}: {
  id: string;
  label: string;
  kind: FileKind;
  required?: boolean;
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handle(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = input.files?.[0] ?? null;
    if (!picked) return;
    const problem = await checkFile(picked, kind);
    if (problem) {
      setError(problem);
      input.value = "";
      return;
    }
    setError(null);
    onPick(picked);
  }

  return (
    <div id={id} className="scroll-mt-24">
      <label className="group cursor-pointer block">
        <div className="aspect-[3/4] border border-border flex items-center justify-center overflow-hidden bg-neutral-50 hover:bg-neutral-100 transition-colors">
          {file ? (
            <Preview key={fileKey(file)} file={file} kind={kind} />
          ) : (
            <div className="text-center px-2">
              <UploadIcon />
              <span className="text-[10px] uppercase tracking-widest text-muted">
                {kind === "video" ? "Upload video" : "Upload"}
              </span>
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted text-center mt-2 leading-snug">
          {label}
          {required && " *"}
        </p>
        <input
          type="file"
          accept={ACCEPT[kind]}
          className="sr-only"
          onChange={handle}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => onPick(null)}
          className="block mx-auto mt-1 text-[10px] uppercase tracking-widest text-muted underline underline-offset-4 hover:text-foreground"
        >
          Remove
        </button>
      )}
      {error && <p className="text-xs text-red-600 text-center mt-1">{error}</p>}
    </div>
  );
}

// Several images under one heading (portfolio, tear sheets).
export function MultiImageSlot({
  id,
  label,
  max,
  files,
  onChange,
}: {
  id: string;
  label: string;
  max: number;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handle(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    const accepted: File[] = [];
    for (const f of picked) {
      const problem = await checkFile(f, "image");
      if (problem) {
        setError(`${f.name}: ${problem}`);
        continue;
      }
      accepted.push(f);
    }
    const next = [...files, ...accepted];
    if (next.length > max) setError(`Up to ${max} images — extras were left off.`);
    else if (accepted.length === picked.length) setError(null);
    onChange(next.slice(0, max));
  }

  return (
    <div id={id} className="scroll-mt-24">
      <p className={labelClass}>
        {label} ({files.length}/{max})
      </p>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {files.map((f, i) => (
          <div key={`${fileKey(f)}-${i}`}>
            <div className="aspect-[3/4] border border-border flex items-center justify-center overflow-hidden bg-neutral-50">
              <Preview file={f} kind="image" />
            </div>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="block mx-auto mt-1 text-[10px] uppercase tracking-widest text-muted underline underline-offset-4 hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ))}
        {files.length < max && (
          <label className="cursor-pointer block">
            <div className="aspect-[3/4] border border-dashed border-border flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
              <div className="text-center px-2">
                <UploadIcon />
                <span className="text-[10px] uppercase tracking-widest text-muted">
                  Add
                </span>
              </div>
            </div>
            <input
              type="file"
              accept={ACCEPT.image}
              multiple
              className="sr-only"
              onChange={handle}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

// ── Missing-field dialog ──

export function MissingFieldsDialog({
  fields,
  onClose,
  onGoTo,
}: {
  fields: MissingField[];
  onClose: () => void;
  onGoTo: (anchorId: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const plural = fields.length > 1;
  const underAge = fields.some((f) => f.label === AGE_MESSAGE);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-fields-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white border border-border p-8 shadow-xl">
        <h2
          id="missing-fields-title"
          className="font-heading text-xl uppercase tracking-wide mb-3"
        >
          {underAge
            ? "We can't accept this submission"
            : plural
              ? "A few fields still need you"
              : "One field still needs you"}
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-5">
          {underAge
            ? AGE_MESSAGE
            : "Please complete the following before submitting:"}
        </p>

        {!underAge && (
          <ul className="space-y-2 mb-7 max-h-56 overflow-y-auto">
            {fields.map((f) => (
              <li key={`${f.anchorId}-${f.label}`}>
                <button
                  type="button"
                  onClick={() => onGoTo(f.anchorId)}
                  className="text-left text-sm underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3">
          {!underAge && (
            <button
              type="button"
              onClick={() => onGoTo(fields[0].anchorId)}
              className="w-full bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
            >
              {plural ? "Take me to the first one" : "Take me there"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-border py-3 text-sm uppercase tracking-widest text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            {underAge ? "Close" : "Keep editing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Submit flow ──

export type SubmitStatus =
  | { state: "idle" }
  | { state: "uploading"; done: number; total: number }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; message: string };

export function SubmitArea({ status }: { status: SubmitStatus }) {
  const busy = status.state === "uploading" || status.state === "sending";
  return (
    <>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors disabled:opacity-50"
      >
        {status.state === "uploading"
          ? `Uploading ${Math.min(status.done + 1, status.total)} of ${status.total}…`
          : status.state === "sending"
            ? "Submitting…"
            : "Submit"}
      </button>
      {status.state === "sent" && (
        <p className="text-sm text-center text-muted" role="status">
          Thank you for your submission. We review in batches and will reach
          out if it&rsquo;s a fit.
        </p>
      )}
      {status.state === "error" && (
        <p className="text-sm text-center text-red-600" role="alert">
          {status.message}
        </p>
      )}
    </>
  );
}

// Uploads the files, then posts everything to the form's API route.
export async function submitIntake({
  form,
  endpoint,
  prefix,
  files,
  startedAt,
  setStatus,
}: {
  form: HTMLFormElement;
  endpoint: string;
  prefix: "talent" | "collab";
  files: PickedFile[];
  startedAt: number;
  setStatus: (s: SubmitStatus) => void;
}): Promise<boolean> {
  const honeypot =
    form.querySelector<HTMLInputElement>('[name="company-website"]')?.value ?? "";
  const entries = collectEntries(form);
  const id = newSubmissionId();

  try {
    const stored = honeypot
      ? []
      : await uploadAll(prefix, id, files, (done, total) =>
          setStatus({ state: "uploading", done, total })
        );
    setStatus({ state: "sending" });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        entries,
        files: stored,
        honeypot,
        elapsedMs: Date.now() - startedAt,
      }),
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
    setStatus({ state: "sent" });
    return true;
  } catch (err) {
    console.error("Submission failed:", err);
    setStatus({
      state: "error",
      message:
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
    });
    return false;
  }
}

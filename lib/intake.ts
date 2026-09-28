import { createHmac, timingSafeEqual } from "node:crypto";
import { get, list, put } from "@vercel/blob";
import { Resend } from "resend";

// Server half of the intake forms. Submissions live in the private Blob store
// as `<kind>/<id>/submission.json` next to their uploaded files. Nothing in
// the store is publicly readable: the owner reaches a submission through a
// signed review link in the notification email.

export type Kind = "talent" | "collab";

export type Entry = { name: string; label: string; section: string; value: string };

export type StoredFile = {
  slot: string;
  label: string;
  pathname: string;
  contentType: string;
  size: number;
};

export type SubmissionRecord = {
  kind: Kind;
  id: string;
  createdAt: string;
  entries: Entry[];
  files: StoredFile[];
};

export const OWNER_EMAIL = "themixsonmethod@gmail.com";
const FROM = "The Mixson Method <no-reply@themixsonmethod.com>";
export const RETENTION_DAYS = 183; // six months

// ── Upload rules (mirrored in components/intake.tsx) ──

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const UPLOAD_PATH_RE =
  /^(talent|collab)\/([0-9a-f-]{36})\/([a-z0-9-]{1,40})\.(jpe?g|png|heic|heif|mp4|mov)$/;

export function parseUploadPath(pathname: string) {
  const m = UPLOAD_PATH_RE.exec(pathname);
  if (!m || !ID_RE.test(m[2])) return null;
  return {
    kind: m[1] as Kind,
    id: m[2],
    isVideo: m[4] === "mp4" || m[4] === "mov",
  };
}

export function isValidId(id: unknown): id is string {
  return typeof id === "string" && ID_RE.test(id);
}

export function isKind(k: unknown): k is Kind {
  return k === "talent" || k === "collab";
}

// ── Signed links ──

function secret() {
  const s = process.env.INTAKE_SECRET;
  if (!s) throw new Error("INTAKE_SECRET is not set in this environment.");
  return s;
}

export function sign(kind: Kind, id: string) {
  return createHmac("sha256", secret()).update(`${kind}/${id}`).digest("base64url");
}

export function verify(kind: unknown, id: unknown, sig: unknown): boolean {
  if (!isKind(kind) || !isValidId(id) || typeof sig !== "string") return false;
  const expected = Buffer.from(sign(kind, id));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function siteUrl() {
  if (process.env.VERCEL_ENV === "production") return "https://www.themixsonmethod.com";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function reviewUrl(kind: Kind, id: string) {
  return `${siteUrl()}/review/${kind}/${id}?s=${sign(kind, id)}`;
}

// ── Records ──

export const recordPath = (kind: Kind, id: string) => `${kind}/${id}/submission.json`;
export const keepPath = (kind: Kind, id: string) => `${kind}/${id}/keep.json`;

export async function readRecord(kind: Kind, id: string): Promise<SubmissionRecord | null> {
  const res = await get(recordPath(kind, id), { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return (await new Response(res.stream).json()) as SubmissionRecord;
}

export async function isKept(kind: Kind, id: string) {
  const { blobs } = await list({ prefix: keepPath(kind, id), limit: 1 });
  return blobs.length > 0;
}

// Every file the client claims to have uploaded must sit in this submission's
// folder and actually exist in the store.
async function confirmFiles(kind: Kind, id: string, files: unknown): Promise<StoredFile[]> {
  if (!Array.isArray(files)) return [];
  const { blobs } = await list({ prefix: `${kind}/${id}/`, limit: 100 });
  const present = new Map(blobs.map((b) => [b.pathname, b.size]));
  const out: StoredFile[] = [];
  for (const f of files.slice(0, 30)) {
    if (!f || typeof f !== "object") continue;
    const { slot, label, pathname, contentType } = f as Record<string, unknown>;
    if (typeof pathname !== "string" || !present.has(pathname)) continue;
    const parsed = parseUploadPath(pathname);
    if (!parsed || parsed.kind !== kind || parsed.id !== id) continue;
    out.push({
      slot: String(slot ?? "").slice(0, 40),
      label: String(label ?? "File").slice(0, 120),
      pathname,
      contentType: String(contentType ?? ""),
      size: present.get(pathname) ?? 0,
    });
  }
  return out;
}

function cleanEntries(entries: unknown): Entry[] {
  if (!Array.isArray(entries)) return [];
  return entries.slice(0, 200).flatMap((e) => {
    if (!e || typeof e !== "object") return [];
    const { name, label, section, value } = e as Record<string, unknown>;
    if (typeof name !== "string" || typeof value !== "string") return [];
    return [
      {
        name: name.slice(0, 80),
        label: String(label ?? name).slice(0, 400),
        section: String(section ?? "").slice(0, 80),
        value: value.slice(0, 5000),
      },
    ];
  });
}

export const valueOf = (entries: Entry[], name: string) =>
  entries.find((e) => e.name === name)?.value.trim() ?? "";

// ── Email ──

function formatBody(record: SubmissionRecord, heading: string) {
  const lines: string[] = [heading, ""];
  let section = "";
  for (const e of record.entries) {
    if (e.section && e.section !== section) {
      section = e.section;
      lines.push("", section.toUpperCase());
    }
    lines.push(`${e.label}: ${e.value || "—"}`);
  }
  lines.push("", "FILES");
  if (record.files.length === 0) lines.push("None");
  for (const f of record.files) {
    lines.push(`${f.label} (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  lines.push(
    "",
    `View the full submission, photos and videos: ${reviewUrl(record.kind, record.id)}`,
    "",
    `Submissions are deleted after 6 months unless you press "Keep" on the review page.`
  );
  return lines.join("\n");
}

export const AUTO_REPLY =
  "Thank you for your submission. We review in batches and will reach out if it's a fit.";

// ── The whole POST flow, shared by both routes ──

type Handle = {
  kind: Kind;
  required: string[];
  subject: (entries: Entry[]) => string;
  heading: string;
};

export async function handleIntake(request: Request, opts: Handle) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid submission." }, { status: 400 });
  }

  // Bots: a filled honeypot or an inhumanly fast submit gets a quiet "success".
  const elapsed = Number(body.elapsedMs);
  if (body.honeypot || (Number.isFinite(elapsed) && elapsed < 3000)) {
    return Response.json({ success: true });
  }

  const { id } = body;
  if (!isValidId(id)) {
    return Response.json({ error: "Invalid submission." }, { status: 400 });
  }

  const entries = cleanEntries(body.entries);

  const age = Number(valueOf(entries, "age"));
  if (!Number.isFinite(age) || age < 18) {
    return Response.json({ error: "Applicants must be 18 or older." }, { status: 400 });
  }
  const missing = opts.required.filter((n) => !valueOf(entries, n));
  if (missing.length > 0) {
    return Response.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set in this environment.");
    return Response.json({ error: "Email is not configured on the server." }, { status: 500 });
  }

  try {
    const record: SubmissionRecord = {
      kind: opts.kind,
      id,
      createdAt: new Date().toISOString(),
      entries,
      files: await confirmFiles(opts.kind, id, body.files),
    };

    await put(recordPath(opts.kind, id), JSON.stringify(record, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const email = valueOf(entries, "email");

    // Outside production, INTAKE_TEST_TO keeps test submissions out of the
    // agency inbox.
    const notify =
      process.env.VERCEL_ENV !== "production" && process.env.INTAKE_TEST_TO
        ? process.env.INTAKE_TEST_TO
        : OWNER_EMAIL;

    const { error } = await resend.emails.send({
      from: FROM,
      to: notify,
      replyTo: email || undefined,
      subject: opts.subject(entries),
      text: formatBody(record, opts.heading),
    });
    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // The applicant's copy is a courtesy: if it fails, the submission still
    // reached the agency, so don't report an error.
    if (email) {
      const { error: replyError } = await resend.emails.send({
        from: FROM,
        to: email,
        replyTo: OWNER_EMAIL,
        subject: "We received your submission — The Mixson Method",
        text: `${AUTO_REPLY}\n\nThe Mixson Method`,
      });
      if (replyError) console.error("Auto-reply failed:", replyError);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return Response.json(
      {
        error:
          err instanceof Error
            ? `Failed to send submission: ${err.message}`
            : "Failed to send submission.",
      },
      { status: 500 }
    );
  }
}

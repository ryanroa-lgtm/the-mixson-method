import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { del, put } from "@vercel/blob";
import {
  RETENTION_DAYS,
  isKept,
  keepPath,
  readRecord,
  sign,
  verify,
  type Entry,
  type Kind,
} from "@/lib/intake";

// Private review page for one submission. Reachable only through the signed
// link in the notification email; anything else is a 404.

export const metadata: Metadata = {
  title: "Submission review — The Mixson Method",
  robots: { index: false, follow: false },
};

async function toggleKeep(formData: FormData) {
  "use server";
  const kind = formData.get("kind");
  const id = formData.get("id");
  const s = formData.get("s");
  if (!verify(kind, id, s)) throw new Error("Unauthorized");
  const k = kind as Kind;
  const i = id as string;
  if (formData.get("keep") === "1") {
    await put(keepPath(k, i), JSON.stringify({ keptAt: new Date().toISOString() }), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } else {
    await del(keepPath(k, i));
  }
  redirect(`/review/${k}/${i}?s=${s}`);
}

function groupBySection(entries: Entry[]) {
  const groups: { section: string; entries: Entry[] }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.section === e.section) last.entries.push(e);
    else groups.push({ section: e.section, entries: [e] });
  }
  return groups;
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { kind, id } = await params;
  const { s } = await searchParams;
  if (!verify(kind, id, s)) notFound();

  const k = kind as Kind;
  const [record, kept] = await Promise.all([readRecord(k, id), isKept(k, id)]);
  if (!record) notFound();

  const sig = sign(k, id);
  const fileUrl = (pathname: string, download = false) =>
    `/api/intake/file?p=${encodeURIComponent(pathname)}&s=${sig}${download ? "&download=1" : ""}`;

  const created = new Date(record.createdAt);
  const deletesOn = new Date(created.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const title =
    record.entries.find((e) => e.name === "legal-name" || e.name === "full-name")?.value ||
    "Submission";

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-muted mb-2">
        {k === "talent" ? "Talent submission" : "Creative collaborator"} · received{" "}
        {fmt(created)}
      </p>
      <h1 className="font-heading text-4xl tracking-wide uppercase mb-8">{title}</h1>

      <form action={toggleKeep} className="border border-border p-6 mb-12 flex flex-wrap items-center justify-between gap-4">
        <input type="hidden" name="kind" value={k} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="s" value={sig} />
        <input type="hidden" name="keep" value={kept ? "0" : "1"} />
        <p className="text-sm leading-relaxed max-w-md">
          {kept
            ? "Kept. This submission won't be deleted automatically."
            : `Not selected yet. This submission and its files will be deleted on ${fmt(deletesOn)} unless you keep it.`}
        </p>
        <button
          type="submit"
          className={
            kept
              ? "border border-border px-6 py-3 text-sm uppercase tracking-widest text-muted hover:text-foreground hover:border-foreground transition-colors"
              : "bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-neutral-700 transition-colors"
          }
        >
          {kept ? "Stop keeping" : "Keep"}
        </button>
      </form>

      {record.files.length > 0 && (
        <div className="mb-16">
          <h2 className="font-heading text-2xl tracking-wide uppercase mb-6">Files</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {record.files.map((f) => {
              const isVideo = f.contentType.startsWith("video/");
              const isHeic = /hei[cf]$/.test(f.contentType);
              return (
                <figure key={f.pathname}>
                  <div className="aspect-[3/4] border border-border bg-neutral-50 flex items-center justify-center overflow-hidden">
                    {isVideo ? (
                      <video src={fileUrl(f.pathname)} controls playsInline preload="metadata" className="w-full h-full object-contain bg-black" />
                    ) : isHeic ? (
                      <span className="text-xs text-muted px-4 text-center">
                        HEIC image — opens in Safari or Photos
                      </span>
                    ) : (
                      <a href={fileUrl(f.pathname)} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img src={fileUrl(f.pathname)} alt={f.label} className="w-full h-full object-cover" />
                      </a>
                    )}
                  </div>
                  <figcaption className="mt-2 text-xs uppercase tracking-widest text-muted flex justify-between gap-2">
                    <span>{f.label}</span>
                    <a href={fileUrl(f.pathname, true)} className="underline underline-offset-4 hover:text-foreground shrink-0">
                      Download
                    </a>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      )}

      {groupBySection(record.entries).map((g, i) => (
        <div key={`${g.section}-${i}`} className="mb-10">
          {g.section && (
            <h2 className="font-heading text-2xl tracking-wide uppercase mb-4">{g.section}</h2>
          )}
          <dl className="divide-y divide-border border-y border-border">
            {g.entries.map((e) => (
              <div key={e.name} className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-1 md:gap-6 py-3 text-sm">
                <dt className="text-muted">{e.label}</dt>
                <dd className="whitespace-pre-wrap break-words">{e.value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}

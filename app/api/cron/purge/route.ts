import { del, list } from "@vercel/blob";
import { RETENTION_DAYS } from "@/lib/intake";

export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;
// Uploads whose form was never submitted are abandoned after a week.
const ORPHAN_DAYS = 7;

// Daily (see vercel.json). Deletes each submission folder older than six
// months unless the owner pressed "Keep" on its review page.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const folders = new Map<
    string,
    { urls: string[]; record?: Date; oldest: Date; kept: boolean }
  >();

  for (const prefix of ["talent/", "collab/"]) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const b of page.blobs) {
        const [kind, id, file] = b.pathname.split("/");
        if (!id || !file) continue;
        const key = `${kind}/${id}`;
        const f = folders.get(key) ?? { urls: [], oldest: b.uploadedAt, kept: false };
        f.urls.push(b.url);
        if (b.uploadedAt < f.oldest) f.oldest = b.uploadedAt;
        if (file === "submission.json") f.record = b.uploadedAt;
        if (file === "keep.json") f.kept = true;
        folders.set(key, f);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }

  const now = Date.now();
  const expired: string[] = [];
  const toDelete: string[] = [];
  for (const [key, f] of folders) {
    if (f.kept) continue;
    const age = now - (f.record ?? f.oldest).getTime();
    const limit = (f.record ? RETENTION_DAYS : ORPHAN_DAYS) * DAY;
    if (age > limit) {
      expired.push(key);
      toDelete.push(...f.urls);
    }
  }

  for (let i = 0; i < toDelete.length; i += 100) {
    await del(toDelete.slice(i, i + 100));
  }

  return Response.json({ checked: folders.size, deleted: expired });
}

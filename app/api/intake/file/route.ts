import { get } from "@vercel/blob";
import { parseUploadPath, verify } from "@/lib/intake";

// Streams one private upload to whoever holds the submission's signed link.
// GET /api/intake/file?p=<pathname>&s=<signature>
export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("p") ?? "";
  const parsed = parseUploadPath(pathname);
  if (!parsed || !verify(parsed.kind, parsed.id, url.searchParams.get("s"))) {
    return new Response("Not found", { status: 404 });
  }

  const res = await get(pathname, { access: "private" });
  if (!res || res.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  const download = url.searchParams.get("download") === "1";
  const filename = pathname.split("/").pop() ?? "file";
  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType,
      "Content-Length": String(res.blob.size),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}

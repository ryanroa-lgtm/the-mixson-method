import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_TYPES,
  parseUploadPath,
} from "@/lib/intake";

// Issues short-lived tokens so the browser can upload a single file straight
// to the private Blob store. The pathname decides what's allowed: it must sit
// in a submission folder, and its extension sets the type and size ceiling.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const parsed = parseUploadPath(pathname);
        if (!parsed) throw new Error("That file can't be uploaded here.");
        return {
          allowedContentTypes: parsed.isVideo ? VIDEO_TYPES : IMAGE_TYPES,
          maximumSizeInBytes: parsed.isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 30 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload refused." },
      { status: 400 }
    );
  }
}

import { handleIntake, valueOf } from "@/lib/intake";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleIntake(request, {
    kind: "collab",
    heading: "New creative collaborator",
    required: ["full-name", "age", "roles", "location", "email", "phone", "instagram", "portfolio-url"],
    subject: (e) =>
      `New Collaborator – ${valueOf(e, "full-name") || "Unknown"} – ${
        valueOf(e, "roles") || "No role selected"
      }`,
  });
}

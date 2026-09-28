import { handleIntake, valueOf } from "@/lib/intake";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleIntake(request, {
    kind: "talent",
    heading: "New talent submission",
    required: [
      "legal-name",
      "age",
      "location",
      "email",
      "phone",
      "instagram",
      "primary-focus",
      "experience",
    ],
    subject: (e) =>
      `New Talent Submission – ${valueOf(e, "legal-name") || "Unknown"} – ${
        valueOf(e, "primary-focus") || "No focus selected"
      }`,
  });
}

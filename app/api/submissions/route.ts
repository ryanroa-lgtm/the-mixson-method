import { Resend } from "resend";

export async function POST(request: Request) {
  const formData = await request.formData();

  // Collect all text fields into a readable email body
  const skipKeys = new Set(["photo-0", "photo-1", "photo-2", "photo-3", "comp-card"]);
  const fields: [string, string][] = [];
  const checkboxFields: Record<string, string[]> = {};

  for (const [key, value] of formData.entries()) {
    if (skipKeys.has(key)) continue;
    if (typeof value !== "string") continue;

    // Group checkbox values under the same key
    const existing = fields.find(([k]) => k === key);
    if (existing) {
      // This is a checkbox with multiple values
      if (!checkboxFields[key]) {
        checkboxFields[key] = [existing[1]];
      }
      checkboxFields[key].push(value);
    } else {
      fields.push([key, value]);
    }
  }

  // Build email text
  const labelMap: Record<string, string> = {
    name: "Full Name",
    age: "Age",
    location: "City & State",
    email: "Email",
    phone: "Phone",
    instagram: "Instagram",
    height: "Height",
    "chest-bust": "Chest/Bust",
    waist: "Waist",
    hips: "Hips",
    inseam: "Inseam",
    "shoe-size": "Shoe Size",
    "hair-color": "Hair Color",
    "eye-color": "Eye Color",
    tattoos: "Visible Tattoos",
    "tattoo-placement": "Tattoo Placement",
    portfolio: "Portfolio Link",
    experience: "Experience Level",
    "posing-classes": "Posing/Runway Classes",
    "open-to-development": "Open to Development",
    "casting-availability": "Casting Availability",
    "modeling-interest": "Modeling Interest",
    "why-mixson": "Why The Mixson Method",
    "past-work": "Past Work",
    "runway-shows": "Runway Shows",
    "runway-details": "Runway Details",
    "paid-work": "Paid Work",
    "posing-training": "Posing Training",
    "currently-represented": "Currently Represented",
    agencies: "Agencies",
    "runway-history": "Runway History",
    "campaign-work": "Campaign Work",
    "representation-type": "Representation Sought",
    "travel-willingness": "Travel Willingness",
    "professional-instagram": "Professional Instagram",
    "agency-guidelines": "Follow Agency Guidelines",
    "no-pay-to-play": "Understands No Pay-to-Play",
    "attend-scheduled": "Attend Scheduled Events",
    "dream-brands": "Dream Brands",
    "goals-12-months": "12-Month Goals",
    "upcoming-travel": "Upcoming Travel",
  };

  const lines = fields.map(([key, value]) => {
    const label = labelMap[key] || key;
    if (checkboxFields[key]) {
      return `${label}: ${checkboxFields[key].join(", ")}`;
    }
    return `${label}: ${value || "—"}`;
  });

  // Collect photo attachments
  const attachments: { filename: string; content: Buffer }[] = [];
  for (let i = 0; i < 4; i++) {
    const file = formData.get(`photo-${i}`) as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: `digital-${i + 1}.jpg`, content: buffer });
    }
  }

  // Comp card
  const compCard = formData.get("comp-card") as File | null;
  if (compCard && compCard.size > 0) {
    const buffer = Buffer.from(await compCard.arrayBuffer());
    attachments.push({ filename: "comp-card.jpg", content: buffer });
  }

  const name = formData.get("name") as string;
  const experience = formData.get("experience") as string;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "The Mixson Method <no-reply@themixsonmethod.com>",
      to: "themixsonmethod@gmail.com",
      replyTo: (formData.get("email") as string) || undefined,
      subject: `New Submission: ${name || "Unknown"} — ${experience || "No level selected"}`,
      text: lines.join("\n") + `\n\n${attachments.length} file(s) attached.`,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return Response.json(
      { error: "Failed to send submission." },
      { status: 500 }
    );
  }
}

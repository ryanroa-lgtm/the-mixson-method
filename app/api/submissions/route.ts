import { Resend } from "resend";

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const instagram = formData.get("instagram") as string;
  const location = formData.get("location") as string;
  const height = formData.get("height") as string;
  const gender = formData.get("gender") as string;
  const portfolio = (formData.get("portfolio") as string) || "N/A";

  if (!name || !email || !phone || !instagram || !location || !height || !gender) {
    return Response.json({ error: "Required fields missing." }, { status: 400 });
  }

  // Collect photo attachments
  const attachments: { filename: string; content: Buffer }[] = [];
  for (let i = 0; i < 4; i++) {
    const file = formData.get(`photo-${i}`) as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "The Mixson Method <onboarding@resend.dev>",
      to: "themixsonmethod@gmail.com",
      replyTo: email,
      subject: `New Submission: ${name} (${gender})`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Instagram: ${instagram}`,
        `City/State: ${location}`,
        `Height: ${height}`,
        `Gender: ${gender}`,
        `Portfolio: ${portfolio}`,
        ``,
        `${attachments.length} photo(s) attached.`,
      ].join("\n"),
      attachments,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to send submission." },
      { status: 500 }
    );
  }
}

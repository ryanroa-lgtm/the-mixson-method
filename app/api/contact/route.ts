import { Resend } from "resend";

export async function POST(request: Request) {
  const { name, email, subject, message, talent } = await request.json();

  if (!name || !email || !subject || !message) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Booking requests name the talent in the subject line so they're
  // scannable in the inbox.
  const emailSubject = talent
    ? `[${subject}] ${talent} — from ${name}`
    : `[${subject}] from ${name}`;

  try {
    await resend.emails.send({
      from: "The Mixson Method <no-reply@themixsonmethod.com>",
      to: "themixsonmethod@gmail.com",
      replyTo: email,
      subject: emailSubject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        ...(talent ? [`Talent: ${talent}`] : []),
        "",
        message,
      ].join("\n"),
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}

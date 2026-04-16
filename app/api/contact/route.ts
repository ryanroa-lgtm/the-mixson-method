import { Resend } from "resend";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !subject || !message) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "The Mixson Method <no-reply@themixsonmethod.com>",
      to: "themixsonmethod@gmail.com",
      replyTo: email,
      subject: `[${subject}] from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}

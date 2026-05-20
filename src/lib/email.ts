import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends an email notification. Fallbacks to mock console logger if SMTP credentials are missing.
 */
export async function sendEmail({ to, subject, text, html }: EmailPayload): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`[EMAIL NOTIFICATION] Attempting to send email to ${to}...`);
  console.log(`[EMAIL NOTIFICATION] Subject: ${subject}`);

  if (!host || !user || !pass) {
    console.log("------------------------------------------------------------------------");
    console.log("⚠️  [EMAIL MOCK LOGGER] SMTP credentials are not configured in .env.local.");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Snippet: ${text.substring(0, 100)}...`);
    console.log("------------------------------------------------------------------------");
    return true; // Return true as mock success
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"LCU Hostel Portal" <${user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL SUCCESS] Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send email via SMTP:", error);
    return false;
  }
}

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends a mock email notification by logging it to the console.
 * Bypasses the need for SMTP servers, credentials, and third-party libraries.
 */
export async function sendEmail({ to, subject, text }: EmailPayload): Promise<boolean> {
  console.log("======================= [MOCK EMAIL DISPATCH] =======================");
  console.log(`[TIMESTAMP] : ${new Date().toISOString()}`);
  console.log(`[TO]        : ${to}`);
  console.log(`[SUBJECT]   : ${subject}`);
  console.log(`[MESSAGE]   :\n${text}`);
  console.log("=====================================================================");
  return true; // Always return true to simulate successful delivery
}

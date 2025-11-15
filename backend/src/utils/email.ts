import nodemailer from "nodemailer";
import { env } from "../config";
import { logger } from "./logger";

let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  // If SMTP is not configured, return null (emails will be logged only)
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn("SMTP not configured - emails will be logged only");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      // For development/testing with self-signed certificates
      tls: {
        rejectUnauthorized: env.NODE_ENV === "production",
      },
    });

    logger.info("Email transporter created");
    return transporter;
  } catch (error) {
    logger.error({ error }, "Failed to create email transporter");
    return null;
  }
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const emailTransporter = getEmailTransporter();
  const from = options.from || env.SMTP_FROM || "noreply@talentconnect.com";

  // Always log email attempts
  logger.info(
    {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      from,
    },
    "Sending email"
  );

  // If SMTP is not configured, just log and return success (for development)
  if (!emailTransporter) {
    logger.info(
      {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 200) + "...",
      },
      "Email would be sent (SMTP not configured)"
    );
    return true;
  }

  try {
    const info = await emailTransporter.sendMail({
      from,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      html: options.html,
    });

    logger.info({ messageId: info.messageId, to: options.to }, "Email sent successfully");
    return true;
  } catch (error) {
    logger.error({ error, to: options.to, subject: options.subject }, "Failed to send email");
    throw error;
  }
}

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  const emailTransporter = getEmailTransporter();
  if (!emailTransporter) {
    return false;
  }

  try {
    await emailTransporter.verify();
    logger.info("SMTP connection verified");
    return true;
  } catch (error) {
    logger.error({ error }, "SMTP connection verification failed");
    return false;
  }
}


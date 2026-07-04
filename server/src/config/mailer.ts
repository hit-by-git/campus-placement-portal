import nodemailer from "nodemailer";
import { env, isTest } from "./env";
import { logger } from "./logger";

const transporter = env.SMTP_USER
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : nodemailer.createTransport({ jsonTransport: true });

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  if (isTest) return;

  const info = await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });

  if (!env.SMTP_USER) {
    logger.info(`[dev-mail] To: ${to} | Subject: ${subject}`, { messageId: info.messageId });
  }
};

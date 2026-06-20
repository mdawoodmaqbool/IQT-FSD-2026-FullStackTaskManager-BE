import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (config.smtp.host && config.smtp.user && config.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export async function sendOtpEmail({ to, code, purpose }) {
  const subject =
    purpose === "reset_password"
      ? "Reset your TaskManager password"
      : "Verify your TaskManager account";

  const text = `Your verification code is ${code}. It expires in ${config.otpExpiresMinutes} minutes. Do not share this code with anyone.`;

  const info = await getTransporter().sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
  });

  if (config.nodeEnv === "development" && !config.smtp.host) {
    console.log(`[DEV EMAIL] To: ${to} | OTP: ${code} | Purpose: ${purpose}`);
    if (info.message) {
      console.log("[DEV EMAIL] Payload:", info.message.toString());
    }
  }

  return info;
}

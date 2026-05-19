import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import config from '../config.json';

export default async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM || config.emailFrom }: any) {
    const resendApiKey = process.env.RESEND_API_KEY || config.resendApiKey;
    const hasResend = !!resendApiKey;

    if (hasResend) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) {
            throw new Error(`Resend API error: ${error.message}`);
        }
        return;
    }

    // Fallback: local SMTP (e.g. Ethereal for development)
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
}

import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const isDev = env.nodeEnv !== 'production';

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    // Dev fallback: log the email
    console.log('=== EMAIL (dev mode) ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log('========================');
    return { success: true, dev: true };
  }

  try {
    const data = await resend.emails.send({
      from: env.emailFrom,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
}

function passwordResetEmailHtml(resetUrl) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background: #111a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>
      <p style="color: #7c7f88; font-size: 14px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${env.clientOrigin}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your Project Archive password',
    html: passwordResetEmailHtml(resetUrl),
  });
}

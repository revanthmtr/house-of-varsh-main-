const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[MAIL SERVICE] Initialized SMTP transporter with host:', process.env.SMTP_HOST);
  } else {
    console.log('[MAIL SERVICE] SMTP credentials not set. Password reset links will be logged to the server console for immediate development access.');
  }
};

initTransporter();

/**
 * Sends a luxury-formatted Password Reset Email
 */
const sendPasswordResetEmail = async ({ to, resetUrl, clientName }) => {
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"House of Varsh Atelier" <concierge@houseofvarsh.com>';
  const name = clientName || 'Valued Client';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0A0103; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FAF5EB; }
        .container { max-width: 580px; margin: 40px auto; background-color: #120106; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .header { padding: 40px 20px 20px; text-align: center; background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(18, 1, 6, 0) 100%); }
        .brand-title { font-family: 'Cinzel', Georgia, serif; font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #D4AF37; margin: 0; }
        .brand-subtitle { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #B38E1E; margin-top: 6px; }
        .divider { height: 1px; width: 60px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); margin: 20px auto; }
        .body { padding: 20px 40px 40px; text-align: center; line-height: 1.7; font-size: 15px; color: rgba(250, 245, 235, 0.85); }
        .greeting { font-size: 18px; font-family: Georgia, serif; color: #FFE8B6; margin-bottom: 16px; }
        .cta-btn { display: inline-block; margin: 28px 0; padding: 14px 34px; background: linear-gradient(135deg, #D4AF37 0%, #AA8010 100%); color: #0A0103 !important; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 30px; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35); }
        .security-note { font-size: 12px; color: rgba(250, 245, 235, 0.45); line-height: 1.5; margin-top: 24px; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 20px; }
        .link-fallback { word-break: break-all; font-size: 11px; color: #B38E1E; margin-top: 10px; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: rgba(250, 245, 235, 0.3); background-color: #080002; letter-spacing: 0.08em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">HOUSE OF VARSH</h1>
          <div class="brand-subtitle">Haute Couture Atelier</div>
          <div class="divider"></div>
        </div>
        <div class="body">
          <div class="greeting">Namaste, ${name}</div>
          <p>We received a request to securely reset the password for your House of Varsh atelier account.</p>
          <p>Click the button below to choose your new password. For your security, this private link is active for <strong>15 minutes</strong>.</p>
          
          <a href="${resetUrl}" class="cta-btn" target="_blank">Reset Password</a>

          <div class="security-note">
            If you did not make this request, you can safely disregard this email. Your existing password remains encrypted and secure.
            <div style="margin-top: 14px;">If the button above does not work, copy and paste this secure link into your browser:</div>
            <div class="link-fallback">${resetUrl}</div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} House of Varsh Atelier. All Rights Reserved.<br/>
          Bengaluru • Hyderabad • Chennai • Worldwide
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: 'Reset Your House of Varsh Password',
        text: `Namaste ${name},\n\nWe received a request to reset your password. Use the following link within 15 minutes:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: htmlContent,
      });
      console.log(`[MAIL SERVICE] Password reset email dispatched to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[MAIL SERVICE] Failed to send email via SMTP:', err);
      // Fall through to log in console for development fallback
    }
  }

  // Fallback / Development logging:
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 [PASSWORD RESET LINK GENERATED FOR: ${to}]`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return { success: true, simulated: true };
};

module.exports = {
  sendPasswordResetEmail,
};

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"LedgerBase" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LedgerBase</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:2px;">LEDGER<span style="color:#e94560;">BASE</span></h1>
              <p style="margin:8px 0 0;color:#a0aec0;font-size:13px;letter-spacing:1px;">FINANCIAL MANAGEMENT SYSTEM</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:32px 48px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#718096;font-size:13px;">This is an automated message from LedgerBase.</p>
              <p style="margin:8px 0 0;color:#718096;font-size:13px;">Please do not reply to this email.</p>
              <p style="margin:16px 0 0;color:#a0aec0;font-size:12px;">© ${new Date().getFullYear()} LedgerBase. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function sendRegisterEmail(userEmail, name) {
  const subject = "Welcome to LedgerBase — Your Account is Ready";

  const text = `Hi ${name},\n\nWelcome to LedgerBase! Your account has been successfully created.\n\nYou can now log in and start managing your finances.\n\nBest regards,\nThe LedgerBase Team`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Welcome aboard, ${name}! 🎉</h2>
    <p style="margin:0 0 32px;color:#718096;font-size:15px;">Your account has been successfully created.</p>

    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Account Holder</p>
      <p style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${name}</p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${userEmail}</p>
    </div>

    <div style="background-color:#f8fafc;border-radius:8px;padding:24px;margin-bottom:32px;">
      <p style="margin:0 0 16px;color:#2d3748;font-size:15px;font-weight:600;">Here's what you can do with LedgerBase:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#e94560;font-size:16px;margin-right:12px;">✦</span>
            <span style="color:#4a5568;font-size:14px;">Send and receive funds instantly</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#e94560;font-size:16px;margin-right:12px;">✦</span>
            <span style="color:#4a5568;font-size:14px;">Track all transactions in real-time</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#e94560;font-size:16px;margin-right:12px;">✦</span>
            <span style="color:#4a5568;font-size:14px;">Manage multiple accounts with ease</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0;color:#718096;font-size:14px;line-height:1.6;">
      If you did not create this account, please contact our support team immediately at 
      <a href="mailto:${process.env.EMAIL_USER}" style="color:#e94560;text-decoration:none;">${process.env.EMAIL_USER}</a>.
    </p>
  `);

  await sendEmail(userEmail, subject, text, html);
}

export async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful — LedgerBase";
  const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const date = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const text = `Hi ${name},\n\nYour transaction of ${formattedAmount} to account ${toAccount} was successful.\n\nDate: ${date}\n\nBest regards,\nThe LedgerBase Team`;

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#f0fff4;border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;font-size:32px;">✓</div>
      <h2 style="margin:16px 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Transaction Successful</h2>
      <p style="margin:0;color:#718096;font-size:15px;">Your payment has been processed successfully.</p>
    </div>

    <div style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Amount Transferred</p>
      <p style="margin:8px 0 0;color:#ffffff;font-size:36px;font-weight:700;">${formattedAmount}</p>
    </div>

    <div style="background-color:#f8fafc;border-radius:8px;padding:24px;margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">Account Holder</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">To Account</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${toAccount}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">Date & Time</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${date}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#718096;font-size:13px;">Status</span>
            <span style="float:right;background-color:#f0fff4;color:#38a169;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">COMPLETED</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0;color:#718096;font-size:14px;line-height:1.6;">
      If you did not authorize this transaction, please contact us immediately at 
      <a href="mailto:${process.env.EMAIL_USER}" style="color:#e94560;text-decoration:none;">${process.env.EMAIL_USER}</a>.
    </p>
  `);

  await sendEmail(userEmail, subject, text, html);
}

export async function sendTransactionFailedEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed — LedgerBase";
  const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const date = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const text = `Hi ${name},\n\nYour transaction of ${formattedAmount} to account ${toAccount} has failed.\n\nDate: ${date}\n\nPlease retry or contact support.\n\nBest regards,\nThe LedgerBase Team`;

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#fff5f5;border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;font-size:32px;">✕</div>
      <h2 style="margin:16px 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Transaction Failed</h2>
      <p style="margin:0;color:#718096;font-size:15px;">We were unable to process your payment.</p>
    </div>

    <div style="background:linear-gradient(135deg,#fc4a1a 0%,#f7b733 100%);border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Amount</p>
      <p style="margin:8px 0 0;color:#ffffff;font-size:36px;font-weight:700;">${formattedAmount}</p>
    </div>

    <div style="background-color:#f8fafc;border-radius:8px;padding:24px;margin-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">Account Holder</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">To Account</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${toAccount}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <span style="color:#718096;font-size:13px;">Date & Time</span>
            <span style="float:right;color:#2d3748;font-size:13px;font-weight:600;">${date}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="color:#718096;font-size:13px;">Status</span>
            <span style="float:right;background-color:#fff5f5;color:#e53e3e;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">FAILED</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color:#fffbeb;border:1px solid #f6e05e;border-radius:8px;padding:16px;margin-bottom:32px;">
      <p style="margin:0;color:#744210;font-size:14px;line-height:1.6;">
        <strong>What to do next?</strong><br>
        Check your account balance and try again. If the issue persists, contact our support team at 
        <a href="mailto:${process.env.EMAIL_USER}" style="color:#e94560;text-decoration:none;">${process.env.EMAIL_USER}</a>.
      </p>
    </div>
  `);

  await sendEmail(userEmail, subject, text, html);
}
'use strict';

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Create Nodemailer transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

const FROM = process.env.EMAIL_FROM || 'WorkForMe <noreply@workforme.space>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PRIMARY_COLOR = '#6366f1';

/**
 * Base HTML email template
 */
function baseTemplate(content, title = 'WorkForMe') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: 800; color: ${PRIMARY_COLOR}; letter-spacing: -0.5px; }
    .logo span { color: #f59e0b; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .btn { display: inline-block; background: ${PRIMARY_COLOR}; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 8px 0; }
    .footer { text-align: center; margin-top: 32px; font-size: 13px; color: #94a3b8; line-height: 1.6; }
    .highlight { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${PRIMARY_COLOR}; }
    h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    p { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Work<span>ForMe</span></div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">AI Mock Interview & Career Platform</p>
      </div>
      ${content}
      <div class="footer">
        <p>© ${new Date().getFullYear()} WorkForMe.Space · All rights reserved</p>
        <p>workforme.space · noreply@workforme.space</p>
        <p style="margin-top: 8px;"><a href="${FRONTEND_URL}/unsubscribe" style="color: #94a3b8;">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send an email with error handling
 */
async function sendEmail({ to, subject, html, text }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email credentials not configured — skipping email send', { to, subject });
    return { skipped: true, reason: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
      text: text || subject,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Failed to send email', { error: err.message, to, subject });
    throw new Error(`Email send failed: ${err.message}`);
  }
}

/**
 * Send email verification email
 */
async function sendVerificationEmail(user, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const content = `
    <h1>Verify Your Email Address</h1>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Welcome to WorkForMe! Please click the button below to verify your email address and activate your account.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <div class="highlight">
      <p style="font-size: 13px; margin: 0;">🔒 This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #94a3b8;">Or copy this URL into your browser:<br><span style="color: #6366f1;">${verifyUrl}</span></p>`;

  return sendEmail({
    to: user.email,
    subject: '✅ Verify your WorkForMe account',
    html: baseTemplate(content, 'Verify Email'),
    text: `Verify your email: ${verifyUrl}`,
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <h1>Reset Your Password</h1>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your WorkForMe password. Click the button below to create a new password.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="highlight">
      <p style="font-size: 13px; margin: 0;">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email — your password will remain unchanged.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #94a3b8;">Or copy this URL:<br><span style="color: #6366f1;">${resetUrl}</span></p>`;

  return sendEmail({
    to: user.email,
    subject: '🔑 Reset your WorkForMe password',
    html: baseTemplate(content, 'Password Reset'),
    text: `Reset your password: ${resetUrl}`,
  });
}

/**
 * Send welcome email after registration
 */
async function sendWelcomeEmail(user) {
  const content = `
    <h1>Welcome to WorkForMe! 🎉</h1>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Your account is all set! WorkForMe is your AI-powered interview coach and career platform. Here's what you can do:</p>
    <div style="margin: 20px 0;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
        <span style="font-size: 20px; margin-right: 12px;">🎙️</span>
        <div><strong>AI Mock Interviews</strong><br><span style="color: #64748b; font-size: 14px;">Practice with intelligent, domain-specific questions</span></div>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
        <span style="font-size: 20px; margin-right: 12px;">📊</span>
        <div><strong>Speech Analysis</strong><br><span style="color: #64748b; font-size: 14px;">Get detailed feedback on your communication</span></div>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
        <span style="font-size: 20px; margin-right: 12px;">📄</span>
        <div><strong>Resume ATS Scoring</strong><br><span style="color: #64748b; font-size: 14px;">Optimize your resume for ATS systems</span></div>
      </div>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${FRONTEND_URL}/dashboard" class="btn">Get Started Now</a>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `🚀 Welcome to WorkForMe, ${user.name}!`,
    html: baseTemplate(content, 'Welcome'),
    text: `Welcome to WorkForMe, ${user.name}! Start your journey at ${FRONTEND_URL}/dashboard`,
  });
}

/**
 * Send interview completion email
 */
async function sendInterviewCompletedEmail(user, interview) {
  const score = interview.overall_score || 0;
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const rating = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Keep Practicing';

  const content = `
    <h1>Interview Complete! 🎯</h1>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>You've completed your <strong>${interview.type}</strong> interview on <strong>${interview.domain || 'General'}</strong>. Here's a quick summary:</p>
    <div style="text-align: center; margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 12px;">
      <div style="font-size: 56px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${score}</div>
      <div style="font-size: 16px; color: #64748b; margin-top: 4px;">out of 100</div>
      <div style="font-size: 20px; font-weight: 600; color: ${scoreColor}; margin-top: 8px;">${rating}</div>
    </div>
    <div class="highlight">
      <p style="margin: 0; font-size: 14px;">📈 Check your full analysis, detailed feedback, and personalized improvement plan in your dashboard.</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${FRONTEND_URL}/interviews/${interview.id}" class="btn">View Full Analysis</a>
    </div>`;

  return sendEmail({
    to: user.email,
    subject: `📊 Interview Complete — You scored ${score}/100!`,
    html: baseTemplate(content, 'Interview Complete'),
    text: `You completed an interview and scored ${score}/100. View analysis at ${FRONTEND_URL}/interviews/${interview.id}`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendInterviewCompletedEmail,
  sendEmail,
};

import { getBaseHtmlTemplate } from './base.template';

export const getWelcomeEmailTemplate = (fullName: string) => {
  const greeting = fullName.trim() ? `Hi ${fullName.trim()},` : 'Hi,';
  const text = `${greeting}\n\nWelcome to OpenCurtain! We're glad you're here.\n\nPlease verify your email address using the link we sent separately so you can submit verified hospital reviews.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>${greeting}</p><p>Welcome to OpenCurtain! We're glad you're here.</p><p>Please verify your email address using the link we sent separately so you can submit verified hospital reviews.</p>`,
  );

  return { subject: 'Welcome to OpenCurtain', text, html };
};

export const getVerificationEmailTemplate = (link: string) => {
  const text = `Verify your email address to get started:\n\n${link}\n\nThis link expires in 24 hours.`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>Welcome to OpenCurtain! Please verify your email address to get started. This link will expire in 24 hours.</p>`,
    'Verify Email Address',
    link,
  );

  return { subject: 'Verify your OpenCurtain account', text, html };
};

export const getPasswordResetEmailTemplate = (link: string) => {
  const text = `Reset your password using this link:\n\n${link}\n\nIf you did not request this, you can ignore this email.`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>We received a request to reset the password for your OpenCurtain account. Click the button below to choose a new password.</p><p>If you did not request this, you can safely ignore this email.</p>`,
    'Reset Password',
    link,
  );

  return { subject: 'Reset your OpenCurtain password', text, html };
};

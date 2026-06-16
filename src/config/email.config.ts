import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  fromAddress: process.env.EMAIL_FROM ?? 'noreply@opencurtain.com',
  fromName: process.env.EMAIL_FROM_NAME ?? 'OpenCurtain',
  contactInbox: process.env.CONTACT_INBOX ?? 'hello@opencurtain.com',
}));

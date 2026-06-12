import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  sendWelcomeEmail(email: string, fullName: string): void {
    const greeting = fullName.trim() ? `Hi ${fullName.trim()},` : 'Hi,';
    this.deliver(
      email,
      'Welcome to OpenCurtain',
      `${greeting}\n\nWelcome to OpenCurtain! We're glad you're here.\n\nPlease verify your email address using the link we sent separately so you can submit verified hospital reviews.\n\n— The OpenCurtain Team`,
    );
  }

  sendVerificationEmail(email: string, token: string): void {
    const link = this.buildLink('/verify-email', token);
    this.deliver(
      email,
      'Verify your OpenCurtain account',
      `Verify your email address to get started:\n\n${link}\n\nThis link expires in 24 hours.`,
    );
  }

  sendPasswordResetEmail(email: string, token: string): void {
    const link = this.buildLink('/reset-password', token);
    this.deliver(
      email,
      'Reset your OpenCurtain password',
      `Reset your password using this link:\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
    );
  }

  sendReviewSubmittedEmail(email: string, hospitalName: string): void {
    this.deliver(
      email,
      'Your OpenCurtain review was received',
      `Thank you for submitting your review${hospitalName ? ` of ${hospitalName}` : ''}.\n\nOur team will review your submission and credential verification. You will receive another email once your review has been reviewed.\n\n— The OpenCurtain Team`,
    );
  }

  sendReviewApprovedEmail(email: string, hospitalName: string): void {
    this.deliver(
      email,
      'Your OpenCurtain review was approved',
      `Good news — your review${hospitalName ? ` of ${hospitalName}` : ''} has been approved and is now visible on OpenCurtain.\n\n— The OpenCurtain Team`,
    );
  }

  sendReviewRejectedEmail(email: string, hospitalName: string): void {
    this.deliver(
      email,
      'Update on your OpenCurtain review',
      `Your review${hospitalName ? ` of ${hospitalName}` : ''} was not approved at this time. You can submit an updated review if you believe this was in error.\n\n— The OpenCurtain Team`,
    );
  }

  private buildLink(path: string, token: string): string {
    const baseUrl = this.configService
      .get<string>('auth.appPublicUrl', 'http://localhost:3000')
      .replace(/\/$/, '');

    return `${baseUrl}${path}?token=${encodeURIComponent(token)}`;
  }

  private deliver(to: string, subject: string, body: string): void {
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );
    const transporter = this.getTransporter();

    if (transporter) {
      const fromName = this.configService.get<string>(
        'email.fromName',
        'OpenCurtain',
      );
      const fromAddress = this.configService.get<string>(
        'email.fromAddress',
        'noreply@opencurtain.com',
      );

      void transporter
        .sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to,
          subject,
          text: body,
        })
        .catch((error) => {
          this.logger.error(`Failed to send email to ${to}: ${error}`);
        });

      return;
    }

    if (nodeEnv === 'production') {
      this.logger.warn(
        `Email delivery is not configured; message to ${to} was not sent (${subject}).`,
      );
      return;
    }

    this.logger.log(`[dev email] to=${to} subject="${subject}" body="${body}"`);
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('email.smtpHost', '');

    if (!host) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('email.smtpPort', 587),
      secure: this.configService.get<boolean>('email.smtpSecure', false),
      auth: {
        user: this.configService.get<string>('email.smtpUser', ''),
        pass: this.configService.get<string>('email.smtpPass', ''),
      },
    });

    return this.transporter;
  }
}

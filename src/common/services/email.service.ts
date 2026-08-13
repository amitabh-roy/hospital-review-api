import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailArgs {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('email.smtpHost');
    const port = this.configService.get<number>('email.smtpPort');
    const user = this.configService.get<string>('email.smtpUser');
    const pass = this.configService.get<string>('email.smtpPass');
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      this.transporter
        .verify()
        .then(() => {
          this.logger.log(`SMTP connection verified successfully for ${host}:${port}`);
        })
        .catch((err) => {
          this.logger.error(
            `SMTP connection failed: ${err.message}. The credentials in your .env file are being rejected by AWS.`,
          );
        });
    } else {
      this.logger.warn('SMTP credentials not fully set. Email delivery is disabled.');
    }
  }

  async sendMail({
    to,
    subject,
    text,
    html,
    replyTo,
  }: SendMailArgs): Promise<void> {
    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');

    if (this.transporter) {
      const fromAddress = this.configService.get<string>(
        'email.fromAddress',
        'support@opencurtain.com',
      );
      const fromName = this.configService.get<string>(
        'email.fromName',
        'OpenCurtain',
      );

      try {
        await this.transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to,
          ...(replyTo && { replyTo }),
          subject,
          text,
          html,
        });
      } catch (error) {
        this.logger.error(`Failed to send email via SMTP to ${to}: ${error}`);
      }
      return;
    }

    if (nodeEnv === 'production') {
      this.logger.warn(`Email delivery is not configured; message to ${to} was not sent (${subject}).`);
      return;
    }

    this.logger.log(
      `[dev email] to=${to} ${replyTo ? `replyTo=${replyTo} ` : ''}subject="${subject}"\nBody preview: ${text.substring(0, 50)}...`,
    );
  }
}

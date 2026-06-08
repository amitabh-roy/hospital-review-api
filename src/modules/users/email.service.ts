import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  sendVerificationEmail(email: string, token: string): void {
    const link = this.buildLink('/verify-email', token);
    this.deliver(
      email,
      'Verify your OpenCurtain account',
      `Verify your email: ${link}`,
    );
  }

  sendPasswordResetEmail(email: string, token: string): void {
    const link = this.buildLink('/reset-password', token);
    this.deliver(
      email,
      'Reset your OpenCurtain password',
      `Reset your password: ${link}`,
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

    if (nodeEnv === 'production') {
      this.logger.warn(
        `Email delivery is not configured; message to ${to} was not sent (${subject}).`,
      );
      return;
    }

    this.logger.log(`[dev email] to=${to} subject="${subject}" body="${body}"`);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): boolean {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT) || 465;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configured for ${user} via ${host}:${port}`);
      return true;
    } else {
      this.logger.warn(
        'No SMTP credentials configured. Emails will be previewed in console logs.',
      );
      return false;
    }
  }

  async sendMail(options: SendMailOptions) {
    // If not initialized yet, try loading from .env
    if (!this.transporter) {
      this.initTransporter();
    }

    const from =
      process.env.MAIL_FROM ||
      process.env.MAIL_USER ||
      'SHOP.CO <no-reply@shop.co>';

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        this.logger.log(
          `REAL EMAIL SENT to ${options.to} (Message ID: ${info.messageId})`,
        );
        return info;
      } catch (err: any) {
        this.logger.error(
          `Failed to send real email to ${options.to}:`,
          err.message,
        );
        throw err;
      }
    } else {
      // Local dev simulated email
      this.logger.log(
        `==================== [EMAIL SIMULATION] ====================`,
      );
      this.logger.log(`FROM:    ${from}`);
      this.logger.log(`TO:      ${options.to}`);
      this.logger.log(`SUBJECT: ${options.subject}`);
      this.logger.log(`BODY:    ${options.text || options.html}`);
      this.logger.log(
        `============================================================`,
      );
      return { messageId: 'simulated-dev-id' };
    }
  }
}

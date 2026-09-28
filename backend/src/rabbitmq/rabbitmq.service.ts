import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { MailService, SendMailOptions } from '../mail/mail.service';

export const EMAIL_QUEUE = 'email_queue';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;

  constructor(private readonly mailService: MailService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {}
  }

  // 1. Establish connection and consumer
  private async connectWithRetry(retries = 5, delay = 3000) {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();

        // Ensure the queue exists and survives broker restarts
        await this.channel.assertQueue(EMAIL_QUEUE, { durable: true });

        this.logger.log(
          `Connected to RabbitMQ on ${url}. Queue "${EMAIL_QUEUE}" ready.`,
        );

        // Start listening for email tasks
        this.startConsumer();
        return;
      } catch (err: any) {
        this.logger.warn(
          `RabbitMQ connection attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay / 1000}s...`,
        );
        if (i === retries - 1) {
          this.logger.error(
            'Could not connect to RabbitMQ broker. Emails will be queued once available.',
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  // 2. PRODUCER: Send an email job to the queue
  async sendEmail(payload: SendMailOptions): Promise<boolean> {
    if (!this.channel) {
      this.logger.warn(
        `RabbitMQ channel not ready. Falling back to direct email sending for ${payload.to}.`,
      );
      await this.mailService.sendMail(payload);
      return false;
    }

    try {
      const message = Buffer.from(JSON.stringify(payload));
      // persistent: true ensures messages are saved to disk
      this.channel.sendToQueue(EMAIL_QUEUE, message, { persistent: true });
      this.logger.log(
        `[RabbitMQ] Email job published to queue for: ${payload.to}`,
      );
      return true;
    } catch (err) {
      this.logger.error(`[RabbitMQ] Failed to publish message:`, err);
      // Fallback direct send
      await this.mailService.sendMail(payload);
      return false;
    }
  }

  // 3. CONSUMER: Listen to queue, send email, and acknowledge
  private startConsumer() {
    if (!this.channel) return;

    this.channel.consume(
      EMAIL_QUEUE,
      async (msg: any) => {
        if (!msg) return;

        try {
          const content = msg.content.toString();
          const emailData: SendMailOptions = JSON.parse(content);

          this.logger.log(
            `[RabbitMQ] Worker received email job: ${emailData.subject} -> ${emailData.to}`,
          );

          // Send email via Nodemailer
          await this.mailService.sendMail(emailData);

          // Acknowledge task completion so RabbitMQ removes it from queue
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error(
            `[RabbitMQ] Worker failed to process message:`,
            err,
          );
          // nack without requeue to prevent infinite crash loop, or requeue if transient
          this.channel.nack(msg, false, false);
        }
      },
      { noAck: false }, // manual acknowledgement
    );

    this.logger.log(
      `[RabbitMQ] Email worker listener active on queue: "${EMAIL_QUEUE}".`,
    );
  }
}

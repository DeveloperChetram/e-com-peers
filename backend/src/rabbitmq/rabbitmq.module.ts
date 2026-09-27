import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
  imports: [MailModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}

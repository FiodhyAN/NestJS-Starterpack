import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailWorker } from '../mail/mail.worker';

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue({
      name: 'email-verification',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailWorker],
})
export class AuthModule {}

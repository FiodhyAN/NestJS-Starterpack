import { Module } from '@nestjs/common';
import { AuthModule } from './modules/authentication/auth.module';
import { UserModule } from './modules/users/user.module';
import { CoreModule } from './core/core.module';
import { MailModule } from './modules/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      },
      defaultJobOptions: {
        attempts: 3,
      }
    }),
    AuthModule,
    UserModule,
    CoreModule,
    MailModule,
  ],
})
export class AppModule {}

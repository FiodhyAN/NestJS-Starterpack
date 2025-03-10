import { Module } from '@nestjs/common';
import { AuthModule } from './modules/authentication/auth.module';
import { UserModule } from './modules/users/user.module';
import { CoreModule } from './core/core.module';
import { MailModule } from './modules/mail/mail.module';
// import { MailService } from './mail/mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    CoreModule,
    MailModule,
  ],
  // providers: [MailService],
})
export class AppModule {}

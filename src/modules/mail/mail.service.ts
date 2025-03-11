import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import {
  convertTimezone,
  encryptData,
  generateRandomString,
} from 'src/utils/helper.util';
import { hash } from 'bcryptjs';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  async sendUserConfirmation(user: User) {
    const token = generateRandomString(16);
    const tokenExpiredAt = new Date(Date.now() + 3600 * 1000 * 24);

    await this.prisma.$transaction(async (prisma) => {
      try {
        await prisma.user.update({
          where: {
            uuid: user.uuid,
          },
          data: {
            email_verification_token: await hash(token, 12),
            email_verification_token_expires_at: tokenExpiredAt,
          },
        });

        const url = `${process.env.FRONTEND_URL}/verify-email?userId=${encryptData(user.uuid)}&token=${encryptData(token)}`;
        await this.mailerService.sendMail({
          to: user.email,
          subject: 'Welcome to CSWEB! Confirm your Email',
          template: './EmailConfirmation',
          context: {
            tokenExpiredAt: convertTimezone(tokenExpiredAt),
            url,
          },
        });
      } catch (error) {
        throw new HttpException(error.message || 'Something went wrong', 500);
      }
    });
  }
}

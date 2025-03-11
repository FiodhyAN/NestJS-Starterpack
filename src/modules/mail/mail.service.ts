import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import path from 'path';
import * as fs from 'fs'
import { PrismaService } from 'src/core/services/prisma.service';
import { convertTimezone, decryptData, encryptData } from 'src/utils/helper.util';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  async sendUserConfirmation(user: User, token: string) {
    try {
      const tokenExpiredAt = new Date(Date.now() + 3600 * 1000 * 24);
      // await this.prisma.user.update({
      //   where: {
      //     uuid: user.uuid,
      //   },
      //   data: {
      //     email_verification_token: token,
      //     email_verification_token_expires_at: tokenExpiredAt,
      //   },
      // });
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
        throw new HttpException(error.message ||'Something went wrong', 500);
    }
  }
}

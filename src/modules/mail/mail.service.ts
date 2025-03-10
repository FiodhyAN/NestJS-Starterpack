import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import { convertTimezone } from 'src/utils/helper.util';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService, private prisma: PrismaService){}

    async sendUserConfirmation(user: User, token: string) {
        let tokenExpiredAt = new Date(Date.now() + (3600 * 1000 * 24))
        await this.prisma.user.update({
            where: {
                uuid: user.uuid
            },
            data: {
                email_verification_token: token,
                email_verification_token_expires_at: tokenExpiredAt
            }
        })
        const url = `${process.env.FRONTEND_URL}/verify-email?userId=${user.uuid}&token=${token}`;
        // const tokenExpiry = convertTimezone(tokenExpiredAt)
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to CSWEB! Confirm your Email',
            template: './EmailConfirmation',
            context: {
                tokenExpiredAt: tokenExpiredAt,
                url
            }
        })
    }
}

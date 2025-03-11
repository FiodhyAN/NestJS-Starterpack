import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';
import { RegisterDTO } from '../../DTO/register.dto';
import { hash } from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { generateRandomString } from 'src/utils/helper.util';
import { User } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface RegisterResponse {
  uuid: string;
  name: string;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    @InjectQueue('email-verification')
    private readonly emailVerificationQueue: Queue,
  ) {}

  async register(registerDTO: RegisterDTO): Promise<RegisterResponse> {
    const { name, username, email, password } = registerDTO;

    let newUser: User;
    try {
      newUser = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            name,
            username,
            email,
            password: await hash(password, 12),
          },
        });

        await this.emailVerificationQueue.add('sendEmailVerification', user);
        // try {
        //   await this.mailService.sendUserConfirmation(user, token);
        // } catch (mailError) {
        //   throw new HttpException(`Error sending confirmation email: ${mailError.message}`, 500);
        // }

        return user;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      throw new HttpException(error.message || 'Internal server error', 500);
    }

    return {
      uuid: newUser.uuid,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
    };
  }
}

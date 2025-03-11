import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';
import { RegisterDTO } from '../../DTO/register.dto';
import { hash } from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { generateRandomString } from 'src/utils/helper.util';
import { User } from '@prisma/client';

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
  ) {}

  async register(registerDTO: RegisterDTO): Promise<RegisterResponse> {
    const { name, username, email, password } = registerDTO;

    let newUser: User;
    try {
      newUser = await this.prisma.$transaction(async (prisma) => {
        const token = generateRandomString(10);
        const user = await prisma.user.create({
          data: {
            name,
            username,
            email,
            email_verification_token: await hash(token, 12),
            email_verification_token_expires_at: new Date(Date.now() + 3600 * 1000 * 24),
            password: await hash(password, 12),
          },
        });

        try {
          await this.mailService.sendUserConfirmation(user, token);
        } catch (mailError) {
          throw new HttpException(`Error sending confirmation email: ${mailError.message}`, 500);
        }

        return user;
      },
    {
      maxWait: 5000,
      timeout: 20000
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

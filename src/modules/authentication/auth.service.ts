import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';
import { RegisterDTO } from '../../DTO/authentication/register.dto';
import { compare, hash } from 'bcryptjs';
import { decryptData, generateRandomString } from 'src/utils/helper.util';
import { User } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VerifyEmailDTO } from 'src/DTO/authentication/verify-email.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

  async verifyEmail(payload: VerifyEmailDTO): Promise<Boolean> {
    try {
      const userId = decryptData(payload.userId);
      const token = decryptData(payload.token);

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          uuid: userId,
        },
      });

      if (user.email_verified) {
        return true;
      }

      if (
        user.email_verification_token_expires_at &&
        user.email_verification_token_expires_at.getTime() < Date.now()
      ) {
        await this.emailVerificationQueue.add('sendEmailVerification', user)
        throw new Error('Token Expired, new mail Have been sent to your email')
      }

      const tokenMatch =
        user.email_verification_token &&
        (await compare(token, user.email_verification_token));

      if (!tokenMatch) {
        throw new Error('Invalid Token');
      }

      await this.prisma.user.update({
        where: {
          uuid: userId,
        },
        data: {
          email_verified: true,
          email_verification_token: null,
          email_verification_token_expires_at: null,
        },
      });

      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

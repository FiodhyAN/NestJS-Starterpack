import { ConflictException, HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/services/prisma.service";
import { RegisterDTO } from "./DTO/register.dto";
import { hash } from "bcryptjs";
import { MailService } from "../mail/mail.service";

export interface RegisterResponse {
    uuid: string,
    name: string,
    username: string,
    email: string,
}
@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService, private mailService: MailService) {}
    async register(registerDTO: RegisterDTO): Promise<RegisterResponse> {
        try {
            const newUser = await this.prisma.user.create({
                data: {
                    name: registerDTO.name,
                    username: registerDTO.username,
                    email:  registerDTO.email,
                    password: await hash(registerDTO.password, 12),
                },
            });

            const token = Math.floor(1000 + Math.random() * 9000).toString();

            await this.mailService.sendUserConfirmation(newUser, token);

            return {
                uuid: newUser.uuid,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email
            }
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Email already registered');
            }

            throw new HttpException(error, 500);
        }
    }
}
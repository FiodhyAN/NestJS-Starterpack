import { IsEmail, IsNotEmpty, IsStrongPassword, Validate } from "class-validator";
import { PrismaService } from "src/core/services/prisma.service";
import { IsEqualTo, IsUnique } from "src/validator/register.decorator";

const prisma = new PrismaService();
export class RegisterDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsUnique({tableName: 'user', column: 'username'}, prisma)
    username: string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsUnique({tableName: 'user', column: 'email'}, prisma)
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    },{
        message: "Password must be at least 8 characters, must contain number, lowercase and uppercase letter, and special character"
    })
    password: string;

    @IsNotEmpty()
    @IsEqualTo('password', { message: 'Confirm password must match new password' })
    confirmPassword: string;
}

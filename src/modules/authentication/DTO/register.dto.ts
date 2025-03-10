import { IsEmail, IsNotEmpty, IsStrongPassword, Validate } from "class-validator";
import { IsEqualTo } from "src/validator/register.validator";

export class RegisterDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    username: string;
    
    @IsNotEmpty()
    @IsEmail()
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

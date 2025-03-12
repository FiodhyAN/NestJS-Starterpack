import { IsNotEmpty } from "class-validator";

export class VerifyEmailDTO {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    token: string
}
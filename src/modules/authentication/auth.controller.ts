import { Body, Controller, HttpException, Post } from "@nestjs/common";
import { AuthService, RegisterResponse } from "./auth.service";
import { RegisterDTO } from "./DTO/register.dto";
import { ApiResponse, responseCreator } from "src/utils/helper.util";
// import { User } from "@prisma/client";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('register')
    async register(@Body() registerDto: RegisterDTO): Promise<ApiResponse<RegisterResponse>> {
        try {
            const user = await this.authService.register(registerDto);
            return responseCreator(200, 'User registered successfully', user);
        } catch (error) {
            throw new HttpException(
                responseCreator(error.response.statusCode, error.response.message, null, error.response.error),
                error.response.statusCode
            );
        }
    }
}
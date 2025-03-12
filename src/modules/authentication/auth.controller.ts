import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthService, RegisterResponse } from './auth.service';
import { RegisterDTO } from '../../DTO/authentication/register.dto';
import { ApiResponse, responseCreator } from 'src/utils/helper.util';
import { VerifyEmailDTO } from 'src/DTO/authentication/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDTO,
  ): Promise<ApiResponse<RegisterResponse>> {
    try {
      const user = await this.authService.register(registerDto);
      return responseCreator(200, 'User registered successfully', user);
    } catch (error) {
      throw new HttpException(
        responseCreator(
          error.response.statusCode || error.status,
          error.message,
          null,
          error.error,
        ),
        error.response.statusCode || error.status || 500,
      );
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() payload: VerifyEmailDTO) {
    try {
      await this.authService.verifyEmail(payload); // Call the renamed service method
      return responseCreator(200, 'Email Successfully Verified', true);
    } catch (error) {
      throw new HttpException(
        responseCreator(
          error.response.statusCode || error.status,
          error.message,
          null,
          error.error,
        ),
        error.response.statusCode || error.status || 500,
      );
    }
  }
}

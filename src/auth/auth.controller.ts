import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ApiBody, ApiOAuth2 } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return req.user;
  }

  @Post('login/google')
  @UseGuards(GoogleAuthGuard)
  @ApiOAuth2(['email', 'profile'])
  async googleAuth() {
    console.log('reached the gogle controler');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect() {
    console.log('reached callback');

    return { message: 'Google login successful' };
  }

  @Post('request-password-reset')
  @ApiBody({ type: RequestResetPasswordDto })
  async requestPasswordReset(@Body('email') { email }: RequestResetPasswordDto) {
    await this.authService.requestPasswordReset(email);
  }
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}

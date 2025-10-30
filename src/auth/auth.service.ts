import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/auth.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AbstractPasswordHasher } from './interfaces/password-hasher.abstract';
import { PasswordJwtPayload } from './types/password-jwt-payload.type';
import type { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from './types/auth-jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: AbstractPasswordHasher,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async register({ password, email }: RegisterDto) {
    const userExists = await this.usersService.checkDuplicateEmail(email);
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(password);
    await this.usersService.createUser({ email, password: hashedPassword });

    return { email };
  }

  async login({ password, email }: LoginDto) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: AuthJwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync<AuthJwtPayload>(payload, {
      secret: this.authConfiguration.accessTokenSecret,
      expiresIn: Number(this.authConfiguration.accessTokenExpiration) || '1d',
    });

    return { accessToken };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new ConflictException('User with this email does not exist');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '15m',
        secret: this.authConfiguration.passwordResetTokenSecret,
      },
    );

    user.passwordResetToken = resetToken;
    await this.usersService.saveUser(user);

    this.logger.debug(`Password reset token generated for user: ${user.email}`);

    return { success: true, message: 'Password reset token generated' };
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    let payload: PasswordJwtPayload;

    try {
      payload = this.jwtService.verify(token, {
        secret: this.authConfiguration.passwordResetTokenSecret,
      });
      this.logger.debug(`Reset token verified for user id: ${payload.sub}`);
    } catch {
      throw new ConflictException('Invalid or expired password reset token');
    }

    const user = await this.usersService.findUserById(payload.sub);

    if (!user || user.passwordResetToken !== token) {
      throw new ConflictException('Invalid or expired password reset token');
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    user.password = hashedPassword;
    user.passwordResetToken = '';
    await this.usersService.saveUser(user);

    return { success: true, message: 'Password has been reset successfully' };
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AbstractPasswordHasher } from './interfaces/password-hasher.abstract';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordJwtPayload } from './types/password-jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly jwtAccessTokenSecret: string;
  private readonly jwtAccessTokenExpiration: number;
  private readonly jwtPasswordResetTokenSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: AbstractPasswordHasher,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtAccessTokenSecret = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');
    this.jwtAccessTokenExpiration =
      this.configService.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRATION') ?? '1d';
    this.jwtPasswordResetTokenSecret = this.configService.getOrThrow<string>(
      'JWT_PASSWORD_RESET_TOKEN_SECRET',
    );
  }

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
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.jwtAccessTokenSecret,
        expiresIn: this.jwtAccessTokenExpiration ?? '1d',
      },
    );

    return { accessToken };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
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
      { expiresIn: '15m', secret: this.jwtPasswordResetTokenSecret },
    );
    user.passwordResetToken = resetToken;
    await this.usersService.saveUser(user);
    console.log('reset token ', resetToken);
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    let payload: PasswordJwtPayload;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.jwtPasswordResetTokenSecret,
      });
      console.log('payload', payload);
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

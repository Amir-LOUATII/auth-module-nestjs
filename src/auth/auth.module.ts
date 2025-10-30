import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AbstractPasswordHasher } from './interfaces/password-hasher.abstract';
import { BcryptPasswordHasherService } from './services/bcrypt-password-hasher.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    UsersModule,
    JwtModule.register({ publicKey: 'secrect_keys' }),
    PassportModule,
  ],
  providers: [
    AuthService,
    {
      provide: AbstractPasswordHasher,
      useClass: BcryptPasswordHasherService,
    },
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

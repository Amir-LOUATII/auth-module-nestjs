import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AbstractPasswordHasher } from './interfaces/password-hasher.abstract';
import { BcryptPasswordHasherService } from './services/bcrypt-password-hasher.service';

@Module({
  providers: [
    AuthService,
    {
      provide: AbstractPasswordHasher,
      useClass: BcryptPasswordHasherService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}

import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  passwordResetTokenSecret: process.env.JWT_PASSWORD_RESET_TOKEN_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));

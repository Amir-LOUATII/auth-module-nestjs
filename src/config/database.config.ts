import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  synchronize: process.env.DB_SYNC === 'true' || false,
}));

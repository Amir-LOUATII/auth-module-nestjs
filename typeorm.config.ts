import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: ['.env.local', '.env'] });

export default new DataSource({
  type: 'postgres',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  url: process.env.DATABASE_URL,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
});

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const DB = Symbol('DB');

@Module({
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.getOrThrow<string>('DATABASE_URL');
        return drizzle(
          postgres(url, { max: 10, prepare: true, ssl: 'require' }),
        );
      },
    },
  ],
  exports: [DB],
})
export class DbModule {}

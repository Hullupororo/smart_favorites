import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  BOT_TOKEN: z.string().min(20),
  DATABASE_URL: z.url(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (raw) => EnvSchema.parse(raw),
    }),
  ],
  providers: [],
  exports: [],
})
export class AppConfigModule {}

// Хелпер для типобезопасного получения переменных, если понадобится:
export const getEnv = <K extends keyof AppEnv>(
  cs: ConfigService<AppEnv, true>,
  key: K,
): AppEnv[K] => cs.getOrThrow(key);

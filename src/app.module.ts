import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [AppConfigModule, BotModule],
})
export class AppModule {}

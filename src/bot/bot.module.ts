// src/bot/bot.module.ts
import { DbModule } from '@/db/db.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot, TelegrafModule } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import { session } from 'telegraf';
import { PRESET } from './constants';
import { CustomNameScene } from './scenes/custom-name.scene';
import { RenameSectionScene } from './scenes/rename-section.scene';
import { SectionsService } from './services/sections.service';
import { UsersService } from './services/users.service';
import type { Session } from './types';
import { HelpUpdate } from './updates/help.update';
import { PresetUpdate } from './updates/preset.update';
import { RetryUpdate } from './updates/retry.update';
import { SectionsUpdate } from './updates/sections.update';
import { StartUpdate } from './updates/start.update';

@Module({
  imports: [
    DbModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return {
          token: cfg.getOrThrow<string>('BOT_TOKEN'),
          launchOptions: { dropPendingUpdates: true },
          middlewares: [
            session({
              defaultSession: (): Session => ({
                mode: 'preset',
                preset: Object.fromEntries(PRESET.map((p) => [p, true])),
                ui: { state: 'idle' },
              }),
            }),
          ],
        };
      },
    }),
  ],
  providers: [
    StartUpdate,
    PresetUpdate,
    HelpUpdate,
    UsersService,
    SectionsService,
    RetryUpdate,
    SectionsUpdate,
    CustomNameScene,
    RenameSectionScene,
  ],
})
export class BotModule implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Онбординг' },
      { command: 'sections', description: 'Категории: список/управление' },
      { command: 'search', description: 'Поиск по сохранёнкам' },
      { command: 'digest', description: 'Настройка дайджестов' },
      { command: 'help', description: 'Как пользоваться' },
    ]);
  }
}

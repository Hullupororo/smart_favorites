import { DbModule } from '@/db/db.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot, TelegrafModule } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import { session } from 'telegraf';
import { CustomNameScene } from './scenes/custom-name.scene';
import { RenameSectionScene } from './scenes/rename-section.scene';
import { DraftStoreService } from './services/draft-store.service';
import { ItemsService } from './services/items.service';
import { ScreenService } from './services/screen.service';
import { SectionsService } from './services/sections.service';
import { UsersService } from './services/users.service';
import type { Session } from './types';
import { HelpUpdate } from './updates/help.update';
import { IngestUpdate } from './updates/ingest.update';
import { SaveItemUpdate } from './updates/save.update';
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
    HelpUpdate,
    UsersService,
    SectionsService,
    SectionsUpdate,
    CustomNameScene,
    RenameSectionScene,
    ScreenService,
    DraftStoreService,
    ItemsService,
    IngestUpdate,
    SaveItemUpdate,
  ],
})
export class BotModule implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Онбординг' },
      { command: 'sections', description: 'Категории: список/управление' },
      { command: 'help', description: 'Как пользоваться' },
    ]);
  }
}

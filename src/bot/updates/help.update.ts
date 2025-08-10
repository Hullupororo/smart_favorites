import { Update, Ctx, Command, Action } from 'nestjs-telegraf';
import type { MyContext } from '../types';
import { safeEditText } from '../utils/telegram';
import { InlineKeyboardMarkup } from 'telegraf/types';
import { buildMainMenu, renderSectionsScreen } from '../utils';
import { MENU_ACTIONS } from '../constants/menu';
import { SectionsService } from '../services/sections.service';

@Update()
export class HelpUpdate {
  constructor(private readonly sectionsService: SectionsService) {}

  @Command('help')
  async onHelp(@Ctx() ctx: MyContext) {
    await ctx.reply(
      [
        'Вот что я умею:',
        '• Пересылай мне сообщения/ссылки — сохраню в категории.',
        '• /sections — список и управление категориями.',
        '• /search запрос — найти сохранёнки.',
        '• /digest — ежедневная/еженедельная подборка.',
      ].join('\n'),
      { reply_markup: buildMainMenu() },
    );
  }

  @Action(MENU_ACTIONS.ADD_CATEGORY)
  async addCategory(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const markup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: '✅ Готово', callback_data: MENU_ACTIONS.PRESET_ADD_DONE }],
        [{ text: '↩️ Назад', callback_data: MENU_ACTIONS.MODE_PRESET }],
      ],
    };
    await safeEditText(
      ctx,
      'Отправляй названия категорий по одной. Когда закончишь — нажми «Готово».',
      { reply_markup: markup },
    );
  }

  @Action(MENU_ACTIONS.SECTIONS)
  async manageSections(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();

    const uid = String(ctx.from!.id);
    const list = await this.sectionsService.listByUser(uid);

    await renderSectionsScreen(ctx, list);
  }

  @Action(MENU_ACTIONS.SEARCH)
  async menuSearch(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    await safeEditText(ctx, 'Напиши: /search ваш_запрос');
  }

  @Action(MENU_ACTIONS.DIGEST)
  async menuDigest(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    await safeEditText(
      ctx,
      'Команда /digest — настроим периодичность и время рассылки.',
    );
  }
}

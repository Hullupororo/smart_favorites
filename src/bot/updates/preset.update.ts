import { Action, Ctx, Update } from 'nestjs-telegraf';
import { CALLBACK_ACTIONS } from '../constants';
import { Lock } from '../decorators/lock.decorator';
import { SectionsService } from '../services/sections.service';
import { UsersService } from '../services/users.service';
import type { MyContext, MySceneContext } from '../types';
import {
  clearState,
  getCallbackPart,
  renderError,
  renderLoading,
  renderPresetScreen,
  safeEditText,
} from '../utils';
import { CUSTOM_NAME_SCENE } from '../constants/scenes';

@Update()
export class PresetUpdate {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly usersService: UsersService,
  ) {}

  @Action(/preset:toggle:.+/)
  async toggle(@Ctx() ctx: MyContext) {
    const name = getCallbackPart(ctx, 2); // preset:toggle:<name>
    if (!name) return;

    // если имя новое (например, в custom), создадим ключ
    if (typeof ctx.session.preset[name] !== 'boolean') {
      ctx.session.preset[name] = true;
    } else {
      ctx.session.preset[name] = !ctx.session.preset[name];
    }

    await ctx.answerCbQuery();
    await renderPresetScreen(ctx, { onlyMarkup: true });
  }

  @Action(CALLBACK_ACTIONS.ADD)
  async askCustom(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();

    await ctx.scene.enter(CUSTOM_NAME_SCENE);
  }

  @Action(CALLBACK_ACTIONS.ADD_DONE)
  async finishAdding(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery('Готово');
    await renderPresetScreen(ctx);
  }

  @Action(CALLBACK_ACTIONS.DONE)
  async preview(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const selected = Object.entries(ctx.session.preset)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (!selected.length) {
      return ctx.answerCbQuery('Выбери хотя бы одну категорию', {
        show_alert: true,
      });
    }

    const text = `Создать категории:\n• ${selected.join('\n• ')}\n\nНажми «Подтвердить», чтобы сохранить.`;
    await safeEditText(ctx, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Подтвердить', callback_data: CALLBACK_ACTIONS.CONFIRM }],
          [{ text: '↩️ Назад', callback_data: CALLBACK_ACTIONS.MODE }],
        ],
      },
    });
  }

  @Action(CALLBACK_ACTIONS.CONFIRM)
  @Lock('preset_confirm')
  async confirm(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();

    const uid = String(ctx.from!.id);
    const selected = Object.entries(ctx.session.preset)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!selected.length) {
      return ctx.answerCbQuery('Пустой список — добавь хотя бы одну', {
        show_alert: true,
      });
    }

    try {
      // 1) Loading
      await renderLoading(ctx, '⏳ Создаю категории...');

      // 2) Работа с БД
      await this.usersService.ensureUser(uid, ctx.from?.language_code);
      await this.sectionsService.createMany(uid, selected);
      await this.usersService.setOnboarded(uid);

      // 3) Success
      clearState(ctx);
      await safeEditText(
        ctx,
        `✅ Готово! Создали:\n• ${selected.join('\n• ')}\n\nПересылай посты/ссылки — предложу категорию и сохраню.\nКоманды: /sections, /search`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '➕ Добавить категорию',
                  callback_data: 'menu:add_category',
                },
              ],
              [
                {
                  text: '📚 Управлять категориями',
                  callback_data: 'menu:sections',
                },
              ],
            ],
          },
        },
      );
    } catch (error) {
      // 4) Error
      await renderError(
        ctx,
        `⚠️ Не удалось сохранить категории. Попробуй ещё раз. ${error}`,
        'retry:preset_confirm',
      );
    }
  }
}

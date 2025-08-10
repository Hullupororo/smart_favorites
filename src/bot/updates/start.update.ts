import { Action, Ctx, Start, Update } from 'nestjs-telegraf';
import { CALLBACK_ACTIONS, PRESET } from '../constants';
import { CUSTOM_NAME_SCENE } from '../constants/scenes';
import type { MyContext, MySceneContext } from '../types';
import { renderPresetScreen } from '../utils';

@Update()
export class StartUpdate {
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    await ctx.reply(
      'Привет! Я помогу складывать сохранёнки по полочкам.\nСначала создадим категории — так будет проще наводить порядок.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🧩 Быстрый старт',
                callback_data: CALLBACK_ACTIONS.MODE,
              },
            ],
            [{ text: '✍️ Свои категории', callback_data: 'mode:custom' }],
          ],
        },
      },
    );
  }

  // Режим пресетов
  @Action(CALLBACK_ACTIONS.MODE)
  async openPreset(@Ctx() ctx: MyContext) {
    ctx.session.mode = 'preset';
    if (Object.keys(ctx.session.preset).length === 0) {
      PRESET.forEach((p) => (ctx.session.preset[p] = true));
    }
    await ctx.answerCbQuery();
    await renderPresetScreen(ctx);
  }

  // Полностью свои категории
  @Action('mode:custom')
  async openCustom(@Ctx() ctx: MySceneContext) {
    ctx.session.mode = 'custom';
    ctx.session.preset = {};
    await ctx.answerCbQuery();

    await ctx.scene.enter(CUSTOM_NAME_SCENE);
  }
}

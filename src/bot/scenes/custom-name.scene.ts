// src/bot/scenes/custom-name.scene.ts
import {
  Scene,
  SceneEnter,
  SceneLeave,
  Ctx,
  On,
  Action,
} from 'nestjs-telegraf';
import type { MySceneContext } from '../types';
import { NAME_REGEX } from '../constants';
import { renderAddOneByOneScreen, renderPresetScreen } from '../utils/render';
import { CUSTOM_NAME_SCENE } from '../constants/scenes';
import { CALLBACK_ACTIONS } from '../constants';

@Scene(CUSTOM_NAME_SCENE)
export class CustomNameScene {
  @SceneEnter()
  async onEnter(@Ctx() ctx: MySceneContext) {
    // Показываем экран «добавлять по одной» сразу
    await renderAddOneByOneScreen(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: MySceneContext) {
    if (!ctx.message || !('text' in ctx.message)) return;
    const name = ctx.message.text.trim();

    if (!NAME_REGEX.test(name)) {
      // Не валидно — показываем подсказку, остаёмся в сцене
      await ctx.reply('❌ Имя должно быть 1–24 символа.');
      return;
    }

    ctx.session.preset ??= {};
    ctx.session.preset[name] = true;

    // Перерисовали экран и продолжаем ждать следующий ввод
    await renderAddOneByOneScreen(ctx);
  }

  // Выход по кнопке «✅ Готово»
  @Action(CALLBACK_ACTIONS.ADD_DONE)
  async onDone(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();
    await renderPresetScreen(ctx, { onlyMarkup: true });
    await ctx.scene.leave();
  }

  @SceneLeave()
  async onLeave() {}
}

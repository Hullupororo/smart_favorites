import {
  Action,
  Ctx,
  On,
  Scene,
  SceneEnter,
  SceneLeave,
} from 'nestjs-telegraf';
import { NAME_REGEX, SECTIONS_ACTIONS } from '../constants';
import { CUSTOM_NAME_SCENE } from '../constants/scenes';
import { ScreenService } from '../services/screen.service';
import { SectionsService } from '../services/sections.service';
import type { MySceneContext } from '../types';
import { renderAddOneByOneScreen } from '../ui/actions/add-section';

@Scene(CUSTOM_NAME_SCENE)
export class CustomNameScene {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly ScreenService: ScreenService,
  ) {}

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

    const uid = String(ctx.from!.id);
    await this.sectionsService.createOne(uid, name);

    // Перерисовали экран и продолжаем ждать следующий ввод
    await renderAddOneByOneScreen(ctx);
  }

  // Выход по кнопке «✅ Готово»
  @Action(SECTIONS_ACTIONS.ADD_DONE)
  async onDone(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();
    await this.ScreenService.showSectionsScreen(ctx);
    await ctx.scene.leave();
  }

  @SceneLeave()
  async onLeave() {}
}

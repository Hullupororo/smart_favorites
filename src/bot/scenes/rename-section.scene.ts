import { Scene, SceneEnter, SceneLeave, Ctx, On } from 'nestjs-telegraf';
import type { MySceneContext } from '../types';
import { SectionsService } from '../services/sections.service';
import { isUniqueViolation } from '../utils';
import { RENAME_SECTION_SCENE } from '../constants/scenes';
import { renderSectionsScreen } from '../ui/sections/render';

@Scene(RENAME_SECTION_SCENE)
export class RenameSectionScene {
  constructor(private readonly sectionsService: SectionsService) {}

  @SceneEnter()
  async onEnter(@Ctx() ctx: MySceneContext) {
    const sectionId = ctx.session.sections?.renameId;
    if (!sectionId) {
      await ctx.reply('❌ Не выбрана категория для переименования.');
      return ctx.scene.leave();
    }
    await ctx.reply('✏️ Введите новое имя категории (1–24 символа):');
  }

  @On('text')
  async onText(@Ctx() ctx: MySceneContext) {
    const sectionId = ctx.session.sections?.renameId;
    if (!sectionId) {
      await ctx.reply('❌ Не выбрана категория.');
      return ctx.scene.leave();
    }

    if (!ctx.message || !('text' in ctx.message)) return;
    const name = ctx.message.text.trim();
    if (name.length < 1 || name.length > 24) {
      return ctx.reply('❌ Имя должно быть от 1 до 24 символов.');
    }

    const uid = String(ctx.from!.id);
    try {
      await this.sectionsService.rename(uid, sectionId, name);
      ctx.session.sections!.renameId = undefined;

      const list = await this.sectionsService.listByUser(uid);
      await renderSectionsScreen(ctx, list);
      await ctx.scene.leave();
    } catch (e: any) {
      if (isUniqueViolation(e)) {
        return ctx.reply('⚠️ Такое имя уже есть. Введите другое.');
      }
      await ctx.reply('⚠️ Не удалось переименовать. Попробуйте ещё раз.');
    }
  }

  @SceneLeave()
  async onLeave() {}
}

import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { SECTIONS_ACTIONS } from '../constants';
import { Lock } from '../decorators/lock.decorator';
import { SectionsService } from '../services/sections.service';
import type { MyContext, MySceneContext } from '../types';
import {
  parseCallbackData,
  renderAskName,
  renderSectionsScreen,
} from '../utils';

@Update()
export class SectionsUpdate {
  constructor(private readonly sectionsService: SectionsService) {}

  @Command('sections')
  @Action(SECTIONS_ACTIONS.OPEN)
  @Lock('sections_open')
  async open(@Ctx() ctx: MyContext) {
    const uid = String(ctx.from!.id);
    const list = await this.sectionsService.listByUser(uid);
    await renderSectionsScreen(ctx, list);
  }

  @Action(SECTIONS_ACTIONS.ADD)
  async askAdd(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    ctx.session.sections ??= {};
    ctx.session.sections.awaitingName = { mode: 'add' };
    await renderAskName(ctx, '➕ Введите имя новой категории (1–24 символа):');
  }

  @Action(/sections:rename:\d+/)
  async askRename(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();
    const id = Number(parseCallbackData(ctx)[2]);

    ctx.session.sections ??= {};
    ctx.session.sections.renameId = id;

    return ctx.scene.enter('renameSection');
  }

  @Action(/sections:delete:\d+/)
  async askDelete(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const id = Number(parseCallbackData(ctx)[2]);
    await ctx.editMessageText('Точно удалить категорию?', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ Да, удалить',
              callback_data: SECTIONS_ACTIONS.DELETE_CONFIRM(id),
            },
          ],
          [{ text: '↩️ Назад', callback_data: SECTIONS_ACTIONS.OPEN }],
        ],
      },
    });
  }

  @Action(/sections:delete:confirm:\d+/)
  @Lock('sections_delete')
  async confirmDelete(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const uid = String(ctx.from!.id);
    const id = Number(parseCallbackData(ctx)[3]);
    await this.sectionsService.remove(uid, id);
    const list = await this.sectionsService.listByUser(uid);
    await renderSectionsScreen(ctx, list);
  }
}

import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { SECTIONS_ACTIONS } from '../constants';
import { ScreenService } from '../services/screen.service';
import { SectionsService } from '../services/sections.service';
import type { MyContext, MySceneContext } from '../types';
import { deleteMarkup } from '../ui/sections/markup/delete';
import { parseCallbackData } from '../utils';
import { HandleAwaitCallback } from '../utils/render/withLoadingMessage';

@Update()
export class SectionsUpdate {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly screenService: ScreenService,
  ) {}

  @Command('sections')
  @Action(SECTIONS_ACTIONS.OPEN)
  async open(@Ctx() ctx: MyContext) {
    await this.screenService.showSectionsScreen(ctx);
  }

  @Action(SECTIONS_ACTIONS.ADD)
  @HandleAwaitCallback({ onSuccess: 'delete' })
  async askAdd(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();
    return this.screenService.startAddCustom(ctx);
  }

  @Action(/sections:rename:\d+/)
  async askRename(@Ctx() ctx: MySceneContext) {
    await ctx.answerCbQuery();
    const id = Number(parseCallbackData(ctx)[2]);

    ctx.session.sections ??= {};
    ctx.session.sections.renameId = id;

    return this.screenService.startRename(ctx);
  }

  @Action(/sections:delete:\d+/)
  async askDelete(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const id = Number(parseCallbackData(ctx)[2]);
    const [text, markup] = deleteMarkup(id);
    await ctx.editMessageText(text, markup);
  }

  @Action(/sections:delete:confirm:\d+/)
  async confirmDelete(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const uid = String(ctx.from!.id);
    const id = Number(parseCallbackData(ctx)[3]);
    await this.sectionsService.remove(uid, id);
    await this.screenService.showSectionsScreen(ctx);
  }
}

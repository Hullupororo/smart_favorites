import { ContentService } from '@/bot/services/content.service';
import type { MyContext } from '@/bot/types';
import { renderItemsPage } from '@/bot/ui/content/renderContent';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Lock } from '../decorators/lock.decorator';
import { HandleAwaitCallback } from '../utils/render/withLoadingMessage';

@Update()
export class ContentUpdate {
  constructor(private readonly content: ContentService) {}

  @Action(/content:list:(\d+)$/)
  @HandleAwaitCallback({ onSuccess: 'delete' })
  async openFirst(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const match = ctx.match as RegExpExecArray;
    const sectionId = Number(match[1]);
    const uid = String(ctx.from!.id);

    const page = await this.content.listSection(uid, sectionId, { limit: 6 });

    await renderItemsPage(ctx, page);
  }

  @Action(/content:more:(\d+):([A-Za-z0-9_-]+)/)
  @Lock('content_load_more')
  @HandleAwaitCallback({ onSuccess: 'delete' })
  async loadMore(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const match = ctx.match as RegExpExecArray;
    const sectionId = Number(match[1]);
    const cursor = match[2];
    const uid = String(ctx.from!.id);

    const page = await this.content.listSection(uid, sectionId, {
      limit: 6,
      cursorToken: cursor,
    });
    await renderItemsPage(ctx, page);
  }
}

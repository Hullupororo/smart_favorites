import { Action, Ctx, Update } from 'nestjs-telegraf';
import { DraftStoreService } from '../services/draft-store.service';
import { DuplicateItemError, ItemsService } from '../services/items.service';
import type { MyContext } from '../types';
import { parseCallbackData } from '../utils';
import { HandleAwaitCallback } from '../utils/render/withLoadingMessage';

@Update()
export class SaveItemUpdate {
  constructor(
    private readonly drafts: DraftStoreService,
    private readonly items: ItemsService,
  ) {}

  @Action(/items:save:([^:]+):(\d+)/)
  @HandleAwaitCallback({ onSuccess: 'delete' })
  async save(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const parts = parseCallbackData(ctx);
    const token = parts[2];
    const sectionId = Number(parts[3]);

    const draft = this.drafts.getDraft(token);
    if (!draft) {
      return ctx.reply(
        '⏳ Время на сохранение истекло. Перешлите сообщение снова.',
      );
    }

    const uid = String(ctx.from!.id);

    try {
      await this.items.create(uid, sectionId, draft);
      await ctx.reply('✅ Сохранено!');
    } catch (e) {
      if (e instanceof DuplicateItemError) {
        await ctx.reply('⚠️ Это уже сохранено.');
      } else {
        await ctx.reply('⚠️ Не удалось сохранить. Попробуйте позже.');
        throw e;
      }
    } finally {
      this.drafts.deleteDraft(token);
    }
  }
}

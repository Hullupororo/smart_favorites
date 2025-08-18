import { ItemsService } from '@/bot/services/items.service';
import type { MyContext } from '@/bot/types';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { HandleAwaitCallback } from '../utils/render/withLoadingMessage';

@Update()
export class ContentDeleteUpdate {
  constructor(private readonly items: ItemsService) {}

  @Action(/content:delete:(\d+)/)
  async ask(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const itemId = Number((ctx.match as RegExpExecArray)[1]);

    const msg = ctx.callbackQuery?.message;
    if (!msg || !('message_id' in msg) || !msg.chat) return;

    await ctx.telegram.editMessageReplyMarkup(
      msg.chat.id,
      msg.message_id,
      'Точно удалить?',
      {
        inline_keyboard: [
          [
            {
              text: '✅ Да, удалить',
              callback_data: `content:delete:confirm:${itemId}:${msg.message_id}`,
            },
          ],
          [
            {
              text: '↩️ Отмена',
              callback_data: `content:delete:cancel:${itemId}:${msg.message_id}`,
            },
          ],
        ],
      },
    );
  }

  @Action(/content:delete:confirm:(\d+):(\d+)/)
  @HandleAwaitCallback({ onSuccess: 'delete', label: 'Удаляю...' })
  async confirm(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const [itemId, msgId] = (ctx.match as RegExpExecArray).slice(1).map(Number);
    const uid = String(ctx.from!.id);

    await this.items.remove(uid, itemId);

    const chatId = ctx.chat?.id;
    if (chatId) {
      try {
        await ctx.telegram.deleteMessage(chatId, msgId);
      } catch {
        // do nothing
      }
    }
  }

  @Action(/content:delete:cancel:(\d+):(\d+)/)
  async cancel(@Ctx() ctx: MyContext) {
    await ctx.answerCbQuery();
    const [itemId, msgId] = (ctx.match as RegExpExecArray).slice(1).map(Number);

    const chatId = ctx.chat?.id;
    if (chatId) {
      // возвращаем кнопку «Удалить» обратно
      await ctx.telegram.editMessageReplyMarkup(chatId, msgId, undefined, {
        inline_keyboard: [
          [
            {
              text: '🗑 Удалить',
              callback_data: `content:delete:${itemId}`,
            },
          ],
        ],
      });
    }
  }
}

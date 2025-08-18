import { MyContext } from '@/bot/types';

export async function safeDeleteMessage(ctx: MyContext, msgId?: number) {
  if (!msgId) return;
  try {
    await ctx.deleteMessage(msgId);
  } catch {
    /* уже удалено / нет прав — игнорим */
  }
}

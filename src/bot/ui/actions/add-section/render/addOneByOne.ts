import type { MySceneContext } from '@/bot/types';
import { Markup } from 'telegraf';

export async function renderAddOneByOneScreen(ctx: MySceneContext) {
  const text =
    'Отправляй категории по одной. Когда закончишь — нажми «Готово».';
  const markup = Markup.inlineKeyboard([
    [{ text: '✅ Готово', callback_data: 'sections:add:done' }],
  ]);

  const message = await ctx.reply(text, markup);
  ctx.session.ui.addBoxId = message?.message_id;
  return message;
}

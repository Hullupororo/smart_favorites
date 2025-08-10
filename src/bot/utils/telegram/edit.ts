import type { MyContext } from '../../types';

export async function safeEditText(ctx: MyContext, text: string, opts?: any) {
  try {
    await ctx.editMessageText(text, opts);
  } catch {
    await ctx.reply(text, opts);
  }
}

export async function safeEditMarkup(ctx: MyContext, markup: any) {
  try {
    await ctx.editMessageReplyMarkup(markup);
  } catch {
    // сообщение могло быть не редактируемым — это ок
  }
}

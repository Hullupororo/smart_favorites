import { MyContext } from '@/bot/types';

export async function renderNoSections(ctx: MyContext) {
  await ctx.reply(
    'У вас пока нет категорий. Нажмите «➕ Добавить категорию», затем вернитесь к сохранению.',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Добавить категорию', callback_data: 'sections:add' }],
        ],
      },
    },
  );
}

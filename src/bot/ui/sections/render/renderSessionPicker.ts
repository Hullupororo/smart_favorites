import { MyContext } from '@/bot/types';

export async function renderSectionPicker(
  ctx: MyContext,
  sections: { id: number; name: string }[],
  token: string,
) {
  const rows = sections.map((s) => [
    { text: `📁 ${s.name}`, callback_data: `items:save:${token}:${s.id}` },
  ]);
  rows.push([{ text: '➕ Добавить категорию', callback_data: 'sections:add' }]);

  await ctx.reply('Выберите категорию для сохранения:', {
    reply_markup: { inline_keyboard: rows },
  });
}

import type { MyContext } from '@/bot/types';
import type { ContentPage } from '@/bot/types/content';
import { Markup } from 'telegraf';
import { renderItem } from './renderItemPage';

export async function renderItemsPage(
  ctx: MyContext,
  page: ContentPage,
): Promise<void> {
  for (const it of page.items) {
    await renderItem(ctx, it);
  }

  if (page.nextCursor) {
    await ctx.reply(
      '—',
      Markup.inlineKeyboard([
        Markup.button.callback(
          'Показать ещё',
          `content:more:${page.sectionId}:${page.nextCursor}`,
        ),
      ]),
    );
  }
}

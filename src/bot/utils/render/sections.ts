import type { MyContext } from '../../types';
import { safeEditText } from '../telegram/edit';
import { SECTIONS_ACTIONS } from '../../constants';

export type UiSection = {
  id: number;
  name: string;
  isDefault: boolean;
  sortOrder: number;
};

export function buildSectionsKeyboard(secs: UiSection[]) {
  const rows: { text: string; callback_data: string }[][] = [];

  for (const s of secs) {
    rows.push([
      {
        text: `${s.isDefault ? '⭐ ' : ''}📁 ${s.name}`,
        callback_data: SECTIONS_ACTIONS.RENAME(s.id),
      },
    ]);
    rows.push([
      {
        text: '✏️ Переименовать',
        callback_data: SECTIONS_ACTIONS.RENAME(s.id),
      },
      { text: '🗑 Удалить', callback_data: SECTIONS_ACTIONS.DELETE(s.id) },
    ]);
  }

  rows.push([{ text: '➕ Добавить', callback_data: SECTIONS_ACTIONS.ADD }]);
  return { inline_keyboard: rows };
}

export async function renderSectionsScreen(ctx: MyContext, secs: UiSection[]) {
  const kb = buildSectionsKeyboard(secs);
  return safeEditText(ctx, 'Категории:', { reply_markup: kb });
}

export async function renderAskName(
  ctx: MyContext,
  prompt: string,
  cancelCb = SECTIONS_ACTIONS.OPEN,
) {
  return safeEditText(ctx, prompt, {
    reply_markup: {
      inline_keyboard: [[{ text: '↩️ Назад', callback_data: cancelCb }]],
    },
  });
}

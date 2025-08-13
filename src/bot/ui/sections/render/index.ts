import { UiSection } from '@/bot/types/sections';
import type { MyContext } from '../../../types';
import { safeEditText } from '../../../utils/telegram/edit';
import {
  getAdd,
  getDelete,
  getName,
  getRename,
  getSectionsMarkup,
} from '../markup';

export function buildSectionsKeyboard(sections: UiSection[]) {
  const rows: { text: string; callback_data: string }[][] = [];

  for (const { name, id } of sections) {
    rows.push(
      [getName({ name: name, id: id })],
      [getRename(id), getDelete(id)],
    );
  }
  rows.push([getAdd()]);

  return { inline_keyboard: rows };
}

export async function renderSectionsScreen(ctx: MyContext, secs: UiSection[]) {
  const [text, markup] = getSectionsMarkup(buildSectionsKeyboard(secs));
  return safeEditText(ctx, text, markup);
}

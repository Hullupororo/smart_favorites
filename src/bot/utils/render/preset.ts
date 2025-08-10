// src/bot/utils/render/preset.ts
import type { MyContext } from '../../types';
import { PRESET, CALLBACK_ACTIONS } from '../../constants';
import { buildPresetKeyboard } from '../../keyboards/preset';
import { safeEditMarkup, safeEditText } from '../telegram/edit';

export function computePresetChips(
  state: Record<string, boolean>,
  mode: 'preset' | 'custom',
) {
  const base = mode === 'preset' ? PRESET : [];
  return Array.from(new Set([...base, ...Object.keys(state)])).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  );
}

export async function renderPresetScreen(
  ctx: MyContext,
  { onlyMarkup = false }: { onlyMarkup?: boolean } = {},
) {
  const { preset: state, mode } = ctx.session;
  const chips = computePresetChips(state, mode);
  const kb = buildPresetKeyboard(state, chips);

  const text =
    mode === 'custom' && chips.length === 0
      ? 'Пока нет категорий. Отправляй названия по одной, потом нажми «Готово».'
      : 'Выбери, что оставить. Можно позже переименовать/добавить.';

  if (onlyMarkup) return safeEditMarkup(ctx, kb);
  return safeEditText(ctx, text, { reply_markup: kb });
}

export async function renderAddOneByOneScreen(ctx: MyContext) {
  return safeEditText(
    ctx,
    'Отправляй названия категорий по одной (1–24 символа).\nКогда закончишь — нажми «Готово».',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Готово', callback_data: CALLBACK_ACTIONS.ADD_DONE }],
          [{ text: '↩️ Назад', callback_data: CALLBACK_ACTIONS.MODE }],
        ],
      },
    },
  );
}

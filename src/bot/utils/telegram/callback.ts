import type { MyContext } from '../../types';

export function parseCallbackData(ctx: MyContext): string[] {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return [];
  const raw = ctx.callbackQuery.data;
  if (typeof raw !== 'string') return [];
  return raw.split(':');
}

export function getCallbackPart(
  ctx: MyContext,
  index: number,
): string | undefined {
  return parseCallbackData(ctx)[index];
}

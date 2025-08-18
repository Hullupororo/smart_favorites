import type { MyContext } from '../../types';
import { safeEditText } from '../telegram';

export async function renderLoading(ctx: MyContext, text = '⏳ Сохраняю...') {
  ctx.session.ui.state = 'loading';
  ctx.session.ui.errorMessage = undefined;
  await safeEditText(ctx, text);
}

export async function renderError(
  ctx: MyContext,
  message = '⚠️ Что-то пошло не так. Попробуй ещё раз.',
  retryCb = 'retry:last',
) {
  ctx.session.ui.state = 'error';
  ctx.session.ui.errorMessage = message;
  await safeEditText(ctx, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔁 Повторить', callback_data: retryCb }],
        [{ text: '↩️ Назад', callback_data: 'mode:preset' }],
      ],
    },
  });
}

export function clearState(ctx: MyContext) {
  ctx.session.ui = { state: 'idle' };
}

import { SECTIONS_ACTIONS } from '@/bot/constants';
import { BACK, READY } from '@/bot/constants/ui';

const text =
  'Отправляй названия категорий по одной (1–24 символа).\nКогда закончишь — нажми «Готово».';

const markup = {
  reply_markup: {
    inline_keyboard: [
      [{ text: READY, callback_data: SECTIONS_ACTIONS.ADD_DONE }],
      [{ text: BACK, callback_data: SECTIONS_ACTIONS.OPEN }],
    ],
  },
};

export const addOneByOneMarkup = [text, markup] as const;

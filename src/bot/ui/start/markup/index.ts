import { SECTIONS_ACTIONS } from '@/bot/constants';
import { ADD_CATEGORY, CATEGORIES } from '@/bot/constants/ui';

const text = 'Привет! Давай настроим категории — добавляй всё, что тебе нужно.';

const markup = {
  reply_markup: {
    inline_keyboard: [
      [{ text: CATEGORIES, callback_data: SECTIONS_ACTIONS.OPEN }],
      [
        {
          text: ADD_CATEGORY,
          callback_data: SECTIONS_ACTIONS.ADD,
        },
      ],
    ],
  },
};

export const startMarkup = [text, markup] as const;

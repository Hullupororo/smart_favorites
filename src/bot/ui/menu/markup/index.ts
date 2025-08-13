import { SECTIONS_ACTIONS } from '@/bot/constants';
import { ADD_CATEGORY, MANAGE_CATEGORIES } from '@/bot/constants/ui';

export const menuMarkup = {
  inline_keyboard: [
    [
      {
        text: ADD_CATEGORY,
        callback_data: SECTIONS_ACTIONS.ADD,
      },
    ],
    [
      {
        text: MANAGE_CATEGORIES,
        callback_data: SECTIONS_ACTIONS.OPEN,
      },
    ],
  ],
};

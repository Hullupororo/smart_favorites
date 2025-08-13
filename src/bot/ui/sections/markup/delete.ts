import { SECTIONS_ACTIONS } from '@/bot/constants';
import { BACK, CONFIRM_DELETE } from '@/bot/constants/ui';

const text = 'Точно удалить категорию?';

const markup = (id: number) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: CONFIRM_DELETE,
          callback_data: SECTIONS_ACTIONS.DELETE_CONFIRM(id),
        },
      ],
      [{ text: BACK, callback_data: SECTIONS_ACTIONS.OPEN }],
    ],
  },
});

export const deleteMarkup = (id: number) => [text, markup(id)] as const;

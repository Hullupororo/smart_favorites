import { MENU_ACTIONS } from 'src/bot/constants/menu';
import { InlineKeyboardMarkup } from 'telegraf/types';

export function buildMainMenu(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: '➕ Добавить категорию',
          callback_data: MENU_ACTIONS.ADD_CATEGORY,
        },
      ],
      [
        {
          text: '📚 Управлять категориями',
          callback_data: MENU_ACTIONS.SECTIONS,
        },
      ],
      [
        {
          text: '🔎 Поиск',
          callback_data: MENU_ACTIONS.SEARCH,
        },
      ],
      [
        {
          text: '🗞 Дайджест',
          callback_data: MENU_ACTIONS.DIGEST,
        },
      ],
    ],
  };
}

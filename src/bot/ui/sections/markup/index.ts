import { ADD, CATEGORIES, DELETE, RENAME } from '@/bot/constants/ui';
import { InlineKeyboardMarkup } from 'telegraf/types';
import { SECTIONS_ACTIONS } from '../../../constants';

export const getName = ({ name, id }: { name: string; id: number }) => ({
  text: `📁 ${name}`,
  callback_data: `content:list:${id}`,
});

export const getRename = (id: number) => ({
  text: RENAME,
  callback_data: SECTIONS_ACTIONS.RENAME(id),
});

export const getAdd = () => ({
  text: ADD,
  callback_data: SECTIONS_ACTIONS.ADD,
});

export const getDelete = (id: number) => ({
  text: DELETE,
  callback_data: SECTIONS_ACTIONS.DELETE(id),
});

export const getSectionsMarkup: (
  keyboard: InlineKeyboardMarkup,
) => [text: string, markup: { reply_markup: InlineKeyboardMarkup }] = (
  keyboard: InlineKeyboardMarkup,
) => [CATEGORIES, { reply_markup: keyboard }];

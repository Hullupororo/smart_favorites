import { HELP_TEXT } from '@/bot/constants/ui';
import { menuMarkup } from '../../menu/markup';

const text = HELP_TEXT.join('\n');

const markup = { reply_markup: menuMarkup };

export const helpMarkup = [text, markup] as const;

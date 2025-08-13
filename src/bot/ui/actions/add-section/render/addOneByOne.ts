import { MyContext } from '@/bot/types';
import { safeEditText } from '@/bot/utils';
import { addOneByOneMarkup } from '../markup';

export async function renderAddOneByOneScreen(ctx: MyContext) {
  const [text, markup] = addOneByOneMarkup;

  return safeEditText(ctx, text, markup);
}

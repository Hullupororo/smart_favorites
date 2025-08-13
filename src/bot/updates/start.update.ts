import { Ctx, Start, Update } from 'nestjs-telegraf';
import type { MyContext } from '../types';
import { startMarkup } from '../ui/start/markup';

@Update()
export class StartUpdate {
  @Start()
  async onStart(@Ctx() ctx: MyContext) {
    const [text, markup] = startMarkup;

    await ctx.reply(text, markup);
  }
}

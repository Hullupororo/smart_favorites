import { Command, Ctx, Update } from 'nestjs-telegraf';
import type { MyContext } from '../types';
import { helpMarkup } from '../ui/help/markup/help';

@Update()
export class HelpUpdate {
  @Command('help')
  async onHelp(@Ctx() ctx: MyContext) {
    const [text, markup] = helpMarkup;
    await ctx.reply(text, markup);
  }
}

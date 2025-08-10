// src/bot/updates/retry.update.ts
import { Action, Ctx, Update } from 'nestjs-telegraf';
import type { MyContext } from '../types';
import { PresetUpdate } from './preset.update'; // чтобы переиспользовать confirm

@Update()
export class RetryUpdate {
  constructor(private readonly presetUpdate: PresetUpdate) {}

  @Action('retry:preset_confirm')
  async retryPresetConfirm(@Ctx() ctx: MyContext) {
    return this.presetUpdate.confirm(ctx); // просто повторяем
  }
}

// src/bot/decorators/lock.decorator.ts
import type { MyContext } from '../types';

export function Lock(key?: string) {
  return function <Args extends unknown[], R>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<
      (ctx: MyContext, ...args: Args) => R | Promise<R>
    >,
  ) {
    const original = descriptor.value!;
    descriptor.value = async function (
      this: unknown,
      ctx: MyContext,
      ...args: Args
    ) {
      const lockKey = `lock:${key ?? propertyKey}`;

      // добавляем «типовое» поле в сессию без any: расширим тип ниже, см. коммент
      if (ctx.session[lockKey]) {
        if (typeof ctx.answerCbQuery === 'function') {
          await ctx.answerCbQuery('⏳ Уже выполняю...');
        }
        return undefined as unknown as R;
      }

      try {
        ctx.session[lockKey] = true;
        return await original.call(this, ctx, ...args);
      } finally {
        ctx.session[lockKey] = false;
      }
    } as typeof original;
  };
}

import type { MyContext } from '@/bot/types';
import type { Message } from 'telegraf/types';

type SuccessBehavior = 'delete' | 'restore' | 'keep';

export interface LoadingEditOptions {
  /** Что показывать во время загрузки */
  label?: string; // по умолчанию '⏳ Загружаю…'
  /**
   * Что делать с сообщением после успешного выполнения:
   * - 'delete'  — удалить сообщение (по умолчанию)
   * - 'restore' — вернуть исходный контент и клавиатуру
   * - 'keep'    — оставить "Загружаю…" как есть
   */
  onSuccess?: SuccessBehavior;
}

/**
 * Декоратор для inline-кнопок:
 * 1) заменяет текст/капшен текущего сообщения на "⏳ …" (без клавиатуры),
 * 2) выполняет хэндлер,
 * 3) при успехе — удаляет/восстанавливает/оставляет (см. onSuccess),
 * 4) при ошибке — восстанавливает исходный текст/капшен и клавиатуру.
 */
export function HandleAwaitCallback(opts: LoadingEditOptions = {}) {
  const { label = '⏳ Загружаю…', onSuccess = 'delete' } = opts;

  return function <Args extends unknown[], R>(
    _target: object,
    _propertyKey: string,
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
      // работать есть смысл только для callback_query
      const msg = ctx.callbackQuery?.message as Message | undefined;
      const chatId = msg && 'chat' in msg ? (msg as any).chat?.id : undefined;
      const msgId =
        msg && 'message_id' in msg ? (msg as any).message_id : undefined;

      // снапшот для восстановления
      const snapshot = {
        isText: !!(msg && 'text' in msg),
        text: (msg as any)?.text as string | undefined,
        caption: (msg as any)?.caption as string | undefined,
        replyMarkup: (msg as any)?.reply_markup as unknown | undefined,
      };

      // 1) показать "Загружаю…" (попытаться отредактировать сообщение)
      let edited = false;
      if (chatId && msgId) {
        try {
          if (snapshot.isText) {
            await ctx.telegram.editMessageText(
              chatId,
              msgId,
              undefined,
              label,
              {
                // убираем клавиатуру на время
                reply_markup: undefined as unknown as never,
              },
            );
          } else {
            await ctx.telegram.editMessageCaption(
              chatId,
              msgId,
              undefined,
              label,
              {
                reply_markup: undefined as unknown as never,
              },
            );
          }
          edited = true;
        } catch {
          // если не смогли — хотя бы всплывашку
          await ctx.answerCbQuery(label, { show_alert: false }).catch(() => {});
        }
      }

      // 2) запустить исходный метод
      try {
        const result = await original.call(this, ctx, ...args);

        // 3) успешное завершение — что делаем с сообщением
        if (edited && chatId && msgId) {
          try {
            if (onSuccess === 'delete') {
              await ctx.telegram.deleteMessage(chatId, msgId);
            } else if (onSuccess === 'restore') {
              if (snapshot.isText) {
                await ctx.telegram.editMessageText(
                  chatId,
                  msgId,
                  undefined,
                  snapshot.text ?? '',
                  { reply_markup: snapshot.replyMarkup as any },
                );
              } else {
                await ctx.telegram.editMessageCaption(
                  chatId,
                  msgId,
                  undefined,
                  snapshot.caption ?? '',
                  { reply_markup: snapshot.replyMarkup as any },
                );
              }
            } // keep — ничего не делаем
          } catch {
            /* игнор */
          }
        }
        return result as R;
      } catch (err) {
        // 4) ошибка — восстановить исходное сообщение
        if (edited && chatId && msgId) {
          try {
            if (snapshot.isText) {
              await ctx.telegram.editMessageText(
                chatId,
                msgId,
                undefined,
                snapshot.text ?? '',
                { reply_markup: snapshot.replyMarkup as any },
              );
            } else {
              await ctx.telegram.editMessageCaption(
                chatId,
                msgId,
                undefined,
                snapshot.caption ?? '',
                { reply_markup: snapshot.replyMarkup as any },
              );
            }
          } catch {
            /* игнор */
          }
        }
        throw err;
      }
    } as typeof original;
  };
}

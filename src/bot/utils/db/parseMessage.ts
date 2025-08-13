import type { MyContext } from '@/bot/types';
import { Message } from 'telegraf/types';
import { isText, isPhoto, isDocument, isVideo } from '../telegram/typeguards';
import { DraftPayload } from '@/bot/services/draft-store.service';

const URL_RE = /(https?:\/\/\S+)/i;

export function parseIncoming(ctx: MyContext): DraftPayload | null {
  const m = ctx.message as Message | undefined;
  if (!m) return null;

  // текст / ссылка
  if (isText(m)) {
    const text = m.text.trim();
    const url = text.match(URL_RE)?.[0];
    return {
      kind: url ? 'link' : 'text',
      text,
      url,
      origin: minimalOrigin(m),
    };
  }

  // фото
  if (isPhoto(m) && m.photo.length) {
    const photo = m.photo[m.photo.length - 1];
    return {
      kind: 'photo',
      text: m.caption ?? undefined,
      tgFileId: photo.file_id,
      tgFileUniqueId: photo.file_unique_id,
      origin: minimalOrigin(m),
    };
  }

  // документ
  if (isDocument(m)) {
    return {
      kind: 'document',
      text: m.caption ?? undefined,
      tgFileId: m.document.file_id,
      tgFileUniqueId: m.document.file_unique_id,
      origin: minimalOrigin(m),
    };
  }

  // видео
  if (isVideo(m)) {
    return {
      kind: 'video',
      text: m.caption ?? undefined,
      tgFileId: m.video.file_id,
      tgFileUniqueId: m.video.file_unique_id,
      origin: minimalOrigin(m),
    };
  }

  // fallback
  return { kind: 'other', origin: minimalOrigin(m) };
}

function minimalOrigin(m: Message) {
  // эти поля есть у всех message-подтипов
  const base: any = {
    chatId: (m as any).chat?.id,
    messageId: (m as any).message_id,
  };
  // добавим форвард-метаданные, если есть
  if ('forward_from_chat' in (m as any)) {
    base.forwardFromChatId = (m as any).forward_from_chat?.id;
    base.forwardFromMessageId = (m as any).forward_from_message_id;
  }
  return base;
}

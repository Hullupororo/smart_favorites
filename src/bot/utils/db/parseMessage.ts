// src/bot/utils/parseMessage.ts
import type { MyContext } from '@/bot/types';
import type {
  DraftPayload,
  LinkPayload,
  Origin,
  SingleMediaPayload,
  TextPayload,
} from '@/bot/types/payload';
import type { Message } from 'telegraf/types';
import {
  isDocMsg,
  isPhotoMsg,
  isTextMsg,
  isVideoMsg,
} from '../telegram/typeguards';

const URL_RE = /(https?:\/\/\S+)/i;

export function parseIncoming(ctx: MyContext): DraftPayload | null {
  const m = ctx.message;
  if (!m) return null;

  // текст / ссылка
  if (isTextMsg(m)) {
    const text = m.text.trim();
    const url = text.match(URL_RE)?.[0];
    return {
      kind: url ? 'link' : 'text',
      text,
      url,
      entities: m.entities,
      origin: minimalOrigin(m),
    } as TextPayload | LinkPayload;
  }

  // фото
  if (isPhotoMsg(m) && m.photo.length) {
    const photo = m.photo[m.photo.length - 1];
    return {
      kind: 'photo',
      text: m.caption ?? undefined,
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
      mediaGroupId: m.media_group_id ?? undefined,
      origin: minimalOrigin(m),
      captionEntities: m.caption_entities,
    } as SingleMediaPayload;
  }

  // документ
  if (isDocMsg(m)) {
    return {
      kind: 'document',
      text: m.caption ?? undefined,
      fileId: m.document.file_id,
      fileUniqueId: m.document.file_unique_id,
      mediaGroupId: m.media_group_id ?? undefined,
      origin: minimalOrigin(m),
      captionEntities: m.caption_entities,
    };
  }

  // видео
  if (isVideoMsg(m)) {
    return {
      kind: 'video',
      text: m.caption ?? undefined,
      fileId: m.video.file_id,
      fileUniqueId: m.video.file_unique_id,
      mediaGroupId: m.media_group_id ?? undefined,
      origin: minimalOrigin(m),
      captionEntities: m.caption_entities,
    };
  }

  // fallback
  return { kind: 'other', origin: minimalOrigin(m) };
}

function minimalOrigin(m: Message): Origin {
  const base: Origin = {
    chatId: m.chat?.id,
    messageId: m.message_id,
  };

  //   if ('forward_from_chat' in m) {
  //     base.forwardFromChatId = m.forward_from_chat?.id;
  //     base.forwardFromChatUsername = m.forward_from_chat?.username;
  //     base.forwardFromMessageId = m.forward_from_message_id;
  //   }

  if ('media_group_id' in m) {
    base.mediaGroupId = m.media_group_id;
  }

  return base;
}

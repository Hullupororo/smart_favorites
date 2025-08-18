// src/bot/types/items.ts

import { MessageEntity } from 'telegraf/types';

/** Метаданные происхождения сообщения/поста. */
export type Origin = {
  chatId?: number;
  messageId?: number;
  forwardFromChatId?: number;
  forwardFromChatUsername?: string;
  forwardFromMessageId?: number;
  mediaGroupId?: string;
};

/** Базовый контракт всех пейлоадов. */
export interface BasePayload {
  origin?: Origin;
}

/** Текст без ссылок. */
export interface TextPayload extends BasePayload {
  kind: 'text';
  text: string;
  entities?: MessageEntity[];
}

/** Текст со ссылкой (url уже извлечён). */
export interface LinkPayload extends BasePayload {
  kind: 'link';
  text: string;
  url: string;
  entities?: MessageEntity[];
}

/** Неподдержанный/прочий контент. */
export interface OtherPayload extends BasePayload {
  kind: 'other';
}

/** Допустимые виды медиа для хранения. */
export type MediaKind = 'photo' | 'video' | 'document';

/** Одиночное медиа (с caption). */
export interface SingleMediaPayload extends BasePayload {
  kind: MediaKind;
  text?: string; // caption
  fileId: string;
  fileUniqueId: string;
  mediaGroupId?: string; // если часть альбома
  captionEntities?: MessageEntity[];
}

/** Элемент альбома. */
export interface AlbumMediaPart {
  kind: MediaKind;
  fileId: string;
  fileUniqueId: string;
  caption?: string;
  captionEntities?: MessageEntity[];
}

/** Альбом (несколько медиа как один пост). */
export interface AlbumPayload extends BasePayload {
  kind: 'album';
  text?: string; // общий caption (если нужен)
  mediaGroupId: string;
  media: AlbumMediaPart[];
}

/** Итоговый пейлоад, который обрабатывает пайплайн сохранения. */
export type DraftPayload =
  | TextPayload
  | LinkPayload
  | OtherPayload
  | SingleMediaPayload
  | AlbumPayload;

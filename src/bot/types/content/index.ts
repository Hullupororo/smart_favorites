import { MessageEntity } from 'telegraf/types';

// Рендер-тип для UI («как в избранном»)
export type RenderableMediaKind = 'photo' | 'video' | 'document';

export type RenderableMediaPart = {
  mediaType: RenderableMediaKind;
  fileId: string;
  fileUniqueId: string;
  caption?: string;
  captionEntities?: MessageEntity[];
};

export type ListOptions = {
  limit?: number; // дефолт задаст сервис
  cursorToken?: string | null; // base64url от { ts, id }
};

export type ContentPage = {
  sectionId: number;
  items: RenderableItem[];
  nextCursor?: string | null;
};

export function isRenderableText(x: RenderableItem): x is TextItem {
  return x.kind === 'text';
}
export function isRenderableLink(x: RenderableItem): x is LinkItem {
  return x.kind === 'link';
}
export function isRenderableMedia(x: RenderableItem): x is MediaItem {
  return x.kind === 'media';
}
export function isRenderableAlbum(x: RenderableItem): x is AlbumItem {
  return x.kind === 'album';
}
export function isRenderableOther(x: RenderableItem): x is OtherItem {
  return x.kind === 'other';
}

// src/bot/types/content/index.ts
export interface TextItem {
  kind: 'text';
  text: string;
  itemId: number;
  entities?: MessageEntity[];
}

export interface LinkItem {
  kind: 'link';
  text?: string;
  url: string;
  itemId: number;
  entities?: MessageEntity[];
}

export type MediaType = 'photo' | 'video' | 'document';

export interface MediaItem {
  kind: 'media';
  itemId: number;
  cap?: MessageEntity[];
  media: {
    mediaType: MediaType;
    fileId: string;
    fileUniqueId: string;
    caption?: string;
    captionEntities?: MessageEntity[];
  };
}

export interface AlbumItem {
  kind: 'album';
  caption?: string;
  itemId: number;
  media: Array<{
    captionEntities?: MessageEntity[];
    mediaType: MediaType;
    fileId: string;
    fileUniqueId: string;
    caption?: string;
  }>;
}

export interface OtherItem {
  kind: 'other';
  itemId: number;
}

export type RenderableItem =
  | TextItem
  | LinkItem
  | MediaItem
  | AlbumItem
  | OtherItem;

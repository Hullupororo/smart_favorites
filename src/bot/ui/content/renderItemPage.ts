import type { MyContext } from '@/bot/types';
import type {
  RenderableItem,
  TextItem,
  LinkItem,
  MediaItem,
  AlbumItem,
  OtherItem,
  RenderableMediaPart,
} from '@/bot/types/content';
import {
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaDocument,
  InputMedia,
} from 'telegraf/types';
import { Markup } from 'telegraf';
import { MediaGroup } from 'node_modules/telegraf/typings/telegram-types';

const delKb = (itemId: number) =>
  Markup.inlineKeyboard([
    Markup.button.callback('🗑 Удалить', `content:delete:${itemId}`),
  ]);

type Renderers = {
  text: (ctx: MyContext, item: TextItem) => Promise<void>;
  link: (ctx: MyContext, item: LinkItem) => Promise<void>;
  media: (ctx: MyContext, item: MediaItem) => Promise<void>;
  album: (ctx: MyContext, item: AlbumItem) => Promise<void>;
  other: (ctx: MyContext, item: OtherItem) => Promise<void>;
};

function toInputMedia(m: RenderableMediaPart): InputMedia {
  if (m.mediaType === 'photo')
    return {
      type: 'photo',
      media: m.fileId,
      caption: m.caption,
      caption_entities: m.captionEntities,
    };
  if (m.mediaType === 'video')
    return {
      type: 'video',
      media: m.fileId,
      caption: m.caption,
      caption_entities: m.captionEntities,
    };
  return {
    type: 'document',
    media: m.fileId,
    caption: m.caption,
    caption_entities: m.captionEntities,
  };
}

const renderers: Renderers = {
  text: async (ctx, item) => {
    await ctx.reply(item.text, {
      ...delKb(item.itemId),
      entities: item.entities,
    });
  },
  link: async (ctx, item) => {
    const text = item.text || item.url;
    await ctx.reply(`${text}\n${item.url}`, {
      ...delKb(item.itemId),
      entities: item.entities,
    });
  },
  media: async (ctx, item) => {
    const m = item.media;
    if (m.mediaType === 'photo') {
      await ctx.replyWithPhoto(m.fileId, {
        caption: m.caption,
        caption_entities: m.captionEntities,
        ...delKb(item.itemId),
      });
    } else if (m.mediaType === 'video') {
      await ctx.replyWithVideo(m.fileId, {
        caption: m.caption,
        caption_entities: m.captionEntities,
        ...delKb(item.itemId),
      });
    } else {
      await ctx.replyWithDocument(m.fileId, {
        caption: m.caption,
        caption_entities: m.captionEntities,
        ...delKb(item.itemId),
      });
    }
  },
  album: async (ctx, item) => {
    const mediaGroup = item.media.map(toInputMedia) as (
      | InputMediaPhoto
      | InputMediaVideo
      | InputMediaDocument
    )[];
    await ctx.replyWithMediaGroup(mediaGroup as MediaGroup);
    const caption = item.caption ?? '—';
    await ctx.reply(caption, delKb(item.itemId));
  },
  other: async (ctx, item) => {
    await ctx.reply('⚠️ (неизвестный тип контента)', delKb(item.itemId));
  },
};

export async function renderItem(ctx: MyContext, item: RenderableItem) {
  return renderers[item.kind](ctx, item as never);
}

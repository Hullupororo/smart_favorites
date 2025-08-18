// src/bot/services/content.service.ts
import { Inject, Injectable } from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, desc, eq, inArray, lt, or } from 'drizzle-orm';
import { DB } from '@/db/db.module';
import { items, itemMedia } from '@/db/schema/items';
import { decodeCursor, encodeCursor } from '@/bot/utils/render/pagination';
import type {
  ContentPage,
  ListOptions,
  RenderableItem,
  RenderableMediaPart,
  RenderableMediaKind,
} from '@/bot/types/content';

type ItemRow = {
  id: number;
  userId: string;
  sectionId: number;
  kind: 'text' | 'link' | 'photo' | 'video' | 'document' | 'album' | 'other';
  text: string | null;
  url: string | null;
  mediaGroupId: string | null;
  mediaCount: number;
  createdAt: Date;
};

type ItemMediaRow = {
  id: number;
  itemId: number;
  kind: RenderableMediaKind; // 'photo' | 'video' | 'document'
  tgFileId: string;
  tgFileUniqueId: string;
  caption: string | null;
  sortOrder: number;
};

@Injectable()
export class ContentService {
  constructor(@Inject(DB) private readonly db: PostgresJsDatabase) {}

  async listSection(
    userId: string,
    sectionId: number,
    opts: ListOptions = {},
  ): Promise<ContentPage> {
    const limit = this.clamp(opts.limit ?? 6, 1, 20);

    const cur = opts.cursorToken ? decodeCursor(opts.cursorToken) : null;
    const cursor = cur ? { ts: new Date(cur.ts), id: cur.id } : undefined;

    const baseWhere = and(
      eq(items.userId, userId),
      eq(items.sectionId, sectionId),
    );
    const where = cursor
      ? and(
          baseWhere,
          or(
            lt(items.createdAt, cursor.ts),
            and(eq(items.createdAt, cursor.ts), lt(items.id, cursor.id)),
          ),
        )
      : baseWhere;

    // на 1 больше для определения наличия следующей страницы
    const rows = (await this.db
      .select({
        id: items.id,
        userId: items.userId,
        sectionId: items.sectionId,
        kind: items.kind,
        text: items.text,
        url: items.url,
        mediaGroupId: items.mediaGroupId,
        mediaCount: items.mediaCount,
        createdAt: items.createdAt,
      })
      .from(items)
      .where(where)
      .orderBy(desc(items.createdAt), desc(items.id))
      .limit(limit + 1)) as ItemRow[];

    const hasMore = rows.length > limit;
    const pageItems = hasMore ? rows.slice(0, limit) : rows;

    // медиа нужны только для типов с вложениями
    const mediaNeededIds = pageItems
      .filter(
        (it) =>
          it.kind === 'album' ||
          it.kind === 'photo' ||
          it.kind === 'video' ||
          it.kind === 'document',
      )
      .map((it) => it.id);

    const mediaByItem = await this.fetchMediaForItems(mediaNeededIds);

    // нормализация в RenderableItem
    const renderables: RenderableItem[] = pageItems.map((it) =>
      this.toRenderable(it, mediaByItem.get(it.id) ?? []),
    );

    const nextCursor = hasMore
      ? encodeCursor({
          ts: pageItems[pageItems.length - 1].createdAt.getTime(), // ⬅️ число
          id: pageItems[pageItems.length - 1].id,
        })
      : null;

    return {
      sectionId,
      items: renderables,
      nextCursor,
    };
  }

  private clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }

  private async fetchMediaForItems(
    itemIds: number[],
  ): Promise<Map<number, ItemMediaRow[]>> {
    const map = new Map<number, ItemMediaRow[]>();
    if (itemIds.length === 0) return map;

    const rows = (await this.db
      .select({
        id: itemMedia.id,
        itemId: itemMedia.itemId,
        kind: itemMedia.kind, // 'photo' | 'video' | 'document'
        tgFileId: itemMedia.tgFileId,
        tgFileUniqueId: itemMedia.tgFileUniqueId,
        caption: itemMedia.caption,
        sortOrder: itemMedia.sortOrder,
      })
      .from(itemMedia)
      .where(inArray(itemMedia.itemId, itemIds))
      .orderBy(itemMedia.itemId, itemMedia.sortOrder)) as ItemMediaRow[];

    for (const r of rows) {
      const arr = map.get(r.itemId) ?? [];
      arr.push(r);
      map.set(r.itemId, arr);
    }
    return map;
  }

  private toRenderable(it: ItemRow, mediaRows: ItemMediaRow[]): RenderableItem {
    const makeSingleMedia = (): RenderableItem => {
      const m = mediaRows[0];
      if (!m) return { kind: 'other', itemId: it.id };
      const part: RenderableMediaPart = {
        mediaType: m.kind,
        fileId: m.tgFileId,
        fileUniqueId: m.tgFileUniqueId,
        caption: m.caption ?? undefined,
      };
      return { kind: 'media', itemId: it.id, media: part };
    };

    const makeAlbum = (): RenderableItem => {
      const parts: RenderableMediaPart[] = mediaRows
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => ({
          mediaType: m.kind,
          fileId: m.tgFileId,
          fileUniqueId: m.tgFileUniqueId,
          caption: m.caption ?? undefined,
        }));
      return {
        kind: 'album',
        itemId: it.id,
        caption: it.text ?? undefined,
        media: parts,
      };
    };

    const handlers: Record<ItemRow['kind'], () => RenderableItem> = {
      text: () => ({ kind: 'text', itemId: it.id, text: it.text ?? '' }),
      link: () => ({
        kind: 'link',
        itemId: it.id,
        text: it.text ?? it.url ?? '',
        url: it.url ?? '',
      }),
      photo: makeSingleMedia,
      video: makeSingleMedia,
      document: makeSingleMedia,
      album: makeAlbum,
      other: () => ({ kind: 'other', itemId: it.id }),
    };

    return handlers[it.kind]();
  }
}

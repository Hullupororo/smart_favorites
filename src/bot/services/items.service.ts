import { Inject, Injectable } from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { InferInsertModel } from 'drizzle-orm';
import { DB } from '@/db/db.module';
import { items, itemMedia } from '@/db/schema/items';
import { DraftPayload } from '../types/payload';
import {
  isLinkPayload,
  isOtherPayload,
  isSingleMediaPayload,
} from '../types/guards';

export class DuplicateItemError extends Error {
  constructor(msg = 'Item already exists') {
    super(msg);
  }
}

@Injectable()
export class ItemsService {
  constructor(@Inject(DB) private readonly db: PostgresJsDatabase) {}

  async create(userId: string, sectionId: number, payload: DraftPayload) {
    if (payload.kind === 'album') {
      const toInsert: InferInsertModel<typeof items> = {
        userId,
        sectionId,
        kind: 'album',
        text: payload.text,
        mediaGroupId: payload.mediaGroupId,
        mediaCount: payload.media.length,
        origin: payload.origin,
      };

      try {
        const [created] = await this.db
          .insert(items)
          .values(toInsert)
          .returning({ id: items.id });
        const itemId = created.id;

        await this.db.insert(itemMedia).values(
          payload.media.map((m, idx) => ({
            itemId,
            kind: m.kind,
            tgFileId: m.fileId,
            tgFileUniqueId: m.fileUniqueId,
            caption: m.caption,
            sortOrder: idx,
          })),
        );
      } catch (e: any) {
        if (e?.code === '23505') throw new DuplicateItemError();
        throw e;
      }
      return;
    }

    if (isOtherPayload(payload)) return;

    const toInsert: InferInsertModel<typeof items> = {
      userId,
      sectionId,
      kind: payload.kind,
      text: payload.text,
      url: isLinkPayload(payload) ? payload.url : undefined,
      mediaGroupId: isSingleMediaPayload(payload)
        ? payload.mediaGroupId
        : undefined,
      origin: payload.origin,
      mediaCount: ['photo', 'video', 'document'].includes(payload.kind) ? 1 : 0,
    };

    try {
      const [created] = await this.db
        .insert(items)
        .values(toInsert)
        .returning({ id: items.id });
      const itemId = created.id;

      if (isSingleMediaPayload(payload)) {
        await this.db.insert(itemMedia).values({
          itemId,
          kind: payload.kind,
          tgFileId: payload.fileId,
          tgFileUniqueId: payload.fileUniqueId,
          caption: payload.text,
          sortOrder: 0,
        });
      }
    } catch (e: any) {
      if (e?.code === '23505') throw new DuplicateItemError();
      throw e;
    }
  }
}

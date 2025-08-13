import { Inject, Injectable } from '@nestjs/common';
import { items } from '@/db/schema/items';
import { DB } from '@/db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DraftPayload } from './draft-store.service';

export class DuplicateItemError extends Error {
  constructor(message?: string) {
    super(message || 'Item already exists');
  }
}

@Injectable()
export class ItemsService {
  constructor(@Inject(DB) private readonly db: PostgresJsDatabase) {}

  async create(userId: string, sectionId: number, parsed: DraftPayload) {
    console.log(parsed);

    await this.db.insert(items).values({
      userId,
      sectionId,
      kind: parsed.kind,
      text: parsed.text,
      url: parsed.url,
      tgFileId: parsed.tgFileId,
      tgFileUniqueId: parsed.tgFileUniqueId,
      //   origin: parsed.origin,
    });
  }
}

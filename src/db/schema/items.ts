import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  sectionId: integer('section_id').notNull(),
  kind: varchar('kind', { length: 16 }).notNull(), // 'text' | 'link' | 'photo' | 'video' | 'document' | 'album' | 'other'
  text: text('text'),
  url: text('url'),
  // --- новое для происхождения/альбомов:
  mediaGroupId: varchar('media_group_id', { length: 64 }),
  originChatId: varchar('origin_chat_id', { length: 64 }),
  originMessageId: varchar('origin_message_id', { length: 64 }),
  mediaCount: integer('media_count').default(0).notNull(),
  origin: jsonb('origin'),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const itemMedia = pgTable('item_media', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').notNull(), // FK на items.id (можно добавить реальный FK в следующей миграции)
  kind: varchar('kind', { length: 16 }).notNull(), // 'photo' | 'video' | 'document' | ...
  tgFileId: text('tg_file_id').notNull(),
  tgFileUniqueId: text('tg_file_unique_id').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

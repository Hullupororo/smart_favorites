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
  sectionId: integer('section_id').notNull(), // FK -> sections.id
  kind: varchar('kind', { length: 16 }).notNull(), // 'text' | 'link' | 'photo' | 'video' | 'doc' | ...
  text: text('text'), // для текста/подписи
  url: text('url'), // для ссылок
  tgFileId: text('tg_file_id'), // file_id (если медиа)
  tgFileUniqueId: text('tg_file_unique_id'),
  origin: jsonb('origin'), // сырые данные апдейта (от кого/куда, message_id и т.п.)
  createdAt: timestamp('created_at', { withTimezone: false })
    .defaultNow()
    .notNull(),
});

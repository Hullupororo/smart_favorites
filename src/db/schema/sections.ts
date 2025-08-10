import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  serial,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const sections = pgTable(
  'sections',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    name: varchar('name', { length: 64 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex('sections_user_name_uq').on(t.userId, t.name),
    index('sections_user_idx').on(t.userId),
    index('sections_sort_idx').on(t.userId, t.sortOrder),
  ],
);

import { DB } from '@/db/db.module';
import { sections } from '@/db/schema';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class SectionsService {
  constructor(@Inject(DB) private readonly db: PostgresJsDatabase) {}

  /**
   * Сохраняет список категорий пачкой. Идемпотентно:
   * - пропускает дубли (unique на (user_id, name))
   * - расставляет sortOrder по порядку массива
   * - помечает isDefault у «Читать позже», если она есть
   */
  async createMany(userId: string, names: string[]) {
    // нормализуем и удалим дубли по регистру
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(name);
    }
    if (!cleaned.length) return [];

    const rows = cleaned.map((name, i) => ({
      userId,
      name,
      sortOrder: i,
      isDefault: name === 'Читать позже',
    }));

    // Вставка с конфликт-резолвом по (user_id, name)
    await this.db
      .insert(sections)
      .values(rows)
      .onConflictDoNothing({ target: [sections.userId, sections.name] });

    // Вернуть актуальный список (на случай, если часть уже существовала)
    const res = await this.db
      .select()
      .from(sections)
      .where(eq(sections.userId, userId));

    return res;
  }

  async listByUser(userId: string) {
    return this.db.select().from(sections).where(eq(sections.userId, userId));
  }

  async rename(userId: string, sectionId: number, newName: string) {
    await this.db
      .update(sections)
      .set({ name: newName })
      .where(and(eq(sections.id, sectionId), eq(sections.userId, userId)));
  }

  async remove(userId: string, sectionId: number) {
    // по желанию: запретить удалять isDefault
    await this.db
      .delete(sections)
      .where(and(eq(sections.id, sectionId), eq(sections.userId, userId)));
  }

  async createOne(userId: string, name: string) {
    await this.createMany(userId, [name]);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DB } from '@/db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: PostgresJsDatabase) {}

  async ensureUser(id: string, lang?: string) {
    const [u] = await this.db.select().from(users).where(eq(users.id, id));
    if (u) return u;
    await this.db.insert(users).values({ id, lang });
    return { id, lang, createdAt: new Date() };
  }

  async setOnboarded(id: string) {
    await this.db
      .update(users)
      .set({ onboardedAt: new Date() })
      .where(eq(users.id, id));
  }
}

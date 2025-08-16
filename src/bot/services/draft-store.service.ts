import { Injectable } from '@nestjs/common';
import { DraftPayload } from '../types/payload';

type Entry = { userId: string; payload: DraftPayload; expiresAt: number };

function now() {
  return Date.now();
}
function nanoid(size = 21) {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < size; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

@Injectable()
export class DraftStoreService {
  private store = new Map<string, Entry>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 минут

  createDraft(
    userId: string,
    payload: DraftPayload,
    ttlMs = this.defaultTtlMs,
  ): string {
    const token = nanoid(16);
    this.store.set(token, { userId, payload, expiresAt: now() + ttlMs });
    return token;
  }

  getDraft(token: string): DraftPayload | undefined {
    const e = this.store.get(token);
    if (!e) return undefined;
    if (e.expiresAt < now()) {
      this.store.delete(token);
      return undefined;
    }
    return e.payload;
    // Не удаляем автоматически — удалим по факту сохранения
  }

  deleteDraft(token: string) {
    this.store.delete(token);
  }
}

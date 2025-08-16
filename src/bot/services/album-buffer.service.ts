import { Injectable } from '@nestjs/common';

export type AlbumPart = {
  kind: 'photo' | 'video' | 'document';
  fileId: string;
  fileUniqueId: string;
  caption?: string;
};

type Bucket = {
  userId: string;
  mediaGroupId: string;
  parts: AlbumPart[];
  timer?: NodeJS.Timeout;
};

// Короткая задержка, чтобы собрать все части альбома
const HOLD_MS = 1200;

@Injectable()
export class AlbumBufferService {
  private buckets = new Map<string, Bucket>(); // key = `${userId}:${mediaGroupId}`

  addPart(
    userId: string,
    mediaGroupId: string,
    part: AlbumPart,
    onReady: (bucket: Bucket) => void | Promise<void>,
  ) {
    const key = `${userId}:${mediaGroupId}`;
    const bucket = this.buckets.get(key) ?? { userId, mediaGroupId, parts: [] };
    bucket.parts.push(part);

    if (bucket.timer) clearTimeout(bucket.timer);
    bucket.timer = setTimeout(() => {
      this.buckets.delete(key);
      onReady(bucket);
    }, HOLD_MS);

    this.buckets.set(key, bucket);
  }
}

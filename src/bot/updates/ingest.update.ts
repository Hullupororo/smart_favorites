import { AlbumBufferService } from '@/bot/services/album-buffer.service';
import { DraftStoreService } from '@/bot/services/draft-store.service';
import { SectionsService } from '@/bot/services/sections.service';
import type { MySceneContext } from '@/bot/types';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { renderNoSections } from '../ui/sections/render/renderNoSections';
import { renderSectionPicker } from '../ui/sections/render/renderSessionPicker';
import { parseIncoming } from '../utils/db/parseMessage';
import { isSingleMediaPayload } from '../types/guards';
import { isTextMsg } from '../utils/telegram/typeguards';

@Update()
export class IngestUpdate {
  constructor(
    private readonly drafts: DraftStoreService,
    private readonly sections: SectionsService,
    private readonly albums: AlbumBufferService,
  ) {}

  @On('message')
  async onMessage(@Ctx() ctx: MySceneContext) {
    // не мешаем сценам (переименование/добавление и т.п.)
    if (ctx.scene?.current) return;

    // пропускаем команды
    if (isTextMsg(ctx.message) && ctx.message.text.startsWith('/')) return;

    const parsed = parseIncoming(ctx);
    if (!parsed) return;

    const uid = String(ctx.from!.id);

    // === A) часть альбома? копим по media_group_id и показываем 1 пикер ===
    if (isSingleMediaPayload(parsed) && parsed.mediaGroupId) {
      this.albums.addPart(
        uid,
        parsed.mediaGroupId,
        {
          kind: parsed.kind,
          fileId: parsed.fileId,
          fileUniqueId: parsed.fileUniqueId,
          caption: parsed.text,
        },
        async (bucket) => {
          // когда собрали все части — формируем единый черновик-альбом
          const albumPayload = {
            kind: 'album' as const,
            mediaGroupId: bucket.mediaGroupId,
            media: bucket.parts.map((p) => ({
              kind: p.kind,
              fileId: p.fileId,
              fileUniqueId: p.fileUniqueId,
              caption: p.caption,
            })),
            origin: parsed.origin,
          };

          const token = this.drafts.createDraft(uid, albumPayload);
          const list = await this.sections.listByUser(uid);
          if (!list.length) {
            await renderNoSections(ctx);
            return;
          }
          await renderSectionPicker(ctx, list, token);
        },
      );
      return;
    }

    // === B) одиночный контент — обычный флоу ===
    const token = this.drafts.createDraft(uid, parsed);
    const list = await this.sections.listByUser(uid);
    if (!list.length) {
      await renderNoSections(ctx);
      return;
    }
    await renderSectionPicker(ctx, list, token);
  }
}

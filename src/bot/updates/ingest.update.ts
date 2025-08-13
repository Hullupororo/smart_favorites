import { Ctx, On, Update } from 'nestjs-telegraf';
import {
  DraftPayload,
  DraftStoreService,
} from '../services/draft-store.service';
import { SectionsService } from '../services/sections.service';
import type { MySceneContext } from '../types';
import { renderNoSections } from '../ui/sections/render/renderNoSections';
import { renderSectionPicker } from '../ui/sections/render/renderSessionPicker';
import { parseIncoming } from '../utils/db/parseMessage';
import { isText } from '../utils/telegram/typeguards';

@Update()
export class IngestUpdate {
  constructor(
    private readonly drafts: DraftStoreService,
    private readonly sections: SectionsService,
  ) {}

  @On('message')
  async onMessage(@Ctx() ctx: MySceneContext) {
    // не мешаем, если пользователь в сцене (добавление/переименование)
    if (ctx.scene?.current) return;

    // пропускаем команды
    if (isText(ctx.message) && String(ctx.message?.text).startsWith('/'))
      return;

    const draft = parseIncoming(ctx);
    if (!draft) return;

    const uid = String(ctx.from!.id);
    const token = this.drafts.createDraft(uid, draft as DraftPayload);

    const list = await this.sections.listByUser(uid);
    if (!list.length) {
      await renderNoSections(ctx);
      return;
    }

    await renderSectionPicker(ctx, list, token);
  }
}

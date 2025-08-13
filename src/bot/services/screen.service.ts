import { Injectable } from '@nestjs/common';
import type { MyContext, MySceneContext } from '../types';
import { SectionsService } from './sections.service';
import { CUSTOM_NAME_SCENE, RENAME_SECTION_SCENE } from '../constants/scenes';
import { renderSectionsScreen } from '../ui/sections/render';

@Injectable()
export class ScreenService {
  constructor(private readonly sections: SectionsService) {}

  async showSectionsScreen(ctx: MyContext) {
    const uid = String(ctx.from!.id);
    const list = await this.sections.listByUser(uid);
    await renderSectionsScreen(ctx, list);
  }

  async startAddCustom(ctx: MySceneContext) {
    await ctx.scene.enter(CUSTOM_NAME_SCENE);
  }

  async startRename(ctx: MySceneContext) {
    await ctx.scene.enter(RENAME_SECTION_SCENE);
  }
}

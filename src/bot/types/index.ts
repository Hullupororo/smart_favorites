import type { Context, Scenes } from 'telegraf';

export type SectionsSession = {
  renameId?: number; // для сцены переименования
  awaitingName?: { mode: 'add' | 'rename'; sectionId?: number }; // если пригодится
};

export type Session = {
  ui: {
    state: 'idle' | 'loading' | 'error' | 'success';
    errorMessage?: string;
  };
  sections?: { renameId?: number };
  forward?: {
    active: boolean; // режим включён?
    defaultSectionId?: number; // опционально: сохранять сразу в выбранную секцию
  };
};

export type MyContext = Context & { session: Session };

export type UIState = 'idle' | 'loading' | 'error' | 'success';

// 2) Контекст для сцен (@Scene, @On внутри сцен)
export type MySceneContext = Scenes.SceneContext & { session: Session };

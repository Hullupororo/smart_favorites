import type { Context, Scenes } from 'telegraf';

export type SectionsSession = {
  renameId?: number; // для сцены переименования
  awaitingName?: { mode: 'add' | 'rename'; sectionId?: number }; // если пригодится
};

export type Session = {
  ui: { state: UIState; errorMessage?: string };
  sections?: SectionsSession;
  locks?: Record<string, boolean>;
};

export type MyContext = Context & { session: Session };

export type UIState = 'idle' | 'loading' | 'error' | 'success';

// 2) Контекст для сцен (@Scene, @On внутри сцен)
export type MySceneContext = Scenes.SceneContext & { session: Session };

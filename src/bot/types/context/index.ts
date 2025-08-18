import type { Context, Scenes } from 'telegraf';

export type SectionsSession = {
  renameId?: number; // для сцены переименования
};

export type Session = {
  ui: {
    state: 'idle' | 'loading' | 'error' | 'success';
    errorMessage?: string;
    addBoxId?: number;
  };
  sections?: { renameId?: number };
};

export type MyContext = Context & { session: Session; match?: RegExpExecArray };

export type UIState = 'idle' | 'loading' | 'error' | 'success';

// 2) Контекст для сцен (@Scene, @On внутри сцен)
export type MySceneContext = Scenes.SceneContext & { session: Session };

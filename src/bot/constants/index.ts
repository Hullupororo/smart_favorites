export const PRESET = [
  'Читать позже',
  'Dev',
  'AI',
  'Маркетинг',
  'Идеи',
] as const;

export const NAME_REGEX = /^[\p{L}\p{N}\s._-]{1,24}$/u;

export const CALLBACK_ACTIONS = {
  ADD: 'preset:add',
  ADD_DONE: 'preset:add:done',
  ADD_CANCEL: 'preset:add:cancel',
  DONE: 'preset:done',
  CONFIRM: 'preset:confirm',
  MODE: 'mode:preset',
} as const;

export const SECTIONS_ACTIONS = {
  OPEN: 'sections:open',
  ADD: 'sections:add',
  RENAME: (id: number) => `sections:rename:${id}`,
  DELETE: (id: number) => `sections:delete:${id}`,
  DELETE_CONFIRM: (id: number) => `sections:delete:confirm:${id}`,
} as const;

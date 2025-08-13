export const NAME_REGEX = /^[\p{L}\p{N}\s._-]{1,24}$/u;

export const SECTIONS_ACTIONS = {
  OPEN: 'sections:open',
  ADD: 'sections:add',
  ADD_DONE: 'sections:add:done',
  RENAME: (id: number) => `sections:rename:${id}`,
  DELETE: (id: number) => `sections:delete:${id}`,
  DELETE_CONFIRM: (id: number) => `sections:delete:confirm:${id}`,
} as const;

export function buildPresetKeyboard(
  state: Record<string, boolean>,
  chips: string[],
) {
  const rows = chips.map((name) => [
    {
      text: `${state[name] ? '✅' : '⬜️'} ${name}`,
      callback_data: `preset:toggle:${name}`,
    },
  ]);

  rows.push([{ text: '➕ Добавить свою…', callback_data: 'preset:add' }]);
  rows.push([{ text: '✅ Готово', callback_data: 'preset:done' }]);

  return { inline_keyboard: rows };
}

// src/bot/utils/text/normalize.ts
export function normalizeCategoryName(s: string) {
  const name = s.trim().replace(/\s+/g, ' ');
  // Капитализация первого символа (опционально)
  return name.charAt(0).toUpperCase() + name.slice(1);
}

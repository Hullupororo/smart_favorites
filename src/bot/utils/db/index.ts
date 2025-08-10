// --- Errors / DB helpers ---
export type PgErrorWithCode = {
  code?: string;
  detail?: string;
  constraint?: string;
};

/**
 * Type guard for Postgres.js / Drizzle errors that carry SQLSTATE code.
 * Example: '23505' — unique_violation.
 */
export function isPgErrorWithCode(err: unknown): err is PgErrorWithCode {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in (err as Record<string, unknown>)
  );
}

/** Convenience helper for checking unique constraint violation (SQLSTATE 23505). */
export function isUniqueViolation(err: unknown): err is PgErrorWithCode {
  return isPgErrorWithCode(err) && err.code === '23505';
}

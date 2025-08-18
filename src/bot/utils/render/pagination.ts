export type Cursor = { ts: number; id: number }; // ts = unix ms (Number)

/** 12 байт: 8 байт ts (BigInt64BE) + 4 байта id (UInt32BE) → base64url */
export function encodeCursor(c: Cursor): string {
  const buf = Buffer.allocUnsafe(12);
  buf.writeBigInt64BE(BigInt(c.ts), 0); // 0..7
  buf.writeUInt32BE(c.id, 8); // 8..11
  return buf.toString('base64url');
}

export function decodeCursor(token?: string | null): Cursor | null {
  if (!token) return null;
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length !== 12) return null;
    const ts = Number(buf.readBigInt64BE(0));
    const id = buf.readUInt32BE(8);
    if (!Number.isFinite(ts) || !Number.isInteger(id)) return null;
    return { ts, id };
  } catch {
    return null;
  }
}

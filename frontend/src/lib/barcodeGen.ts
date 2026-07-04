/**
 * EAN-13 barcode generator.
 *
 * Format:  12 data digits + 1 check digit (13 total)
 * Prefix  "200" = in-store / generic retail (GS1 prefix for "local use")
 */

// ── Checksum ─────────────────────────────────────────────────────────────
function ean13CheckDigit(code12: string): number {
  const digits = code12.split('').map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

/**
 * Generate a valid EAN-13 barcode string.
 *
 * @param seed  Up to 9-digit numeric seed (e.g. product ID). Padding/truncation handled.
 * @returns     13-character string, e.g. "2001234567890"
 */
export function generateEan13(seed: number | string): string {
  const s = String(seed).replace(/\D/g, '').slice(0, 9).padStart(9, '0');
  const base = `200${s}`;               // "200" prefix + 9-digit payload = 12 digits
  const check = ean13CheckDigit(base);
  return `${base}${check}`;
}

/**
 * Generate a Code-128 barcode (alphanumeric, variable length).
 * Falls back to this when EAN-13 isn't suitable.
 */
export function generateCode128(seed: number | string): string {
  const prefix = 'AXP';
  const s = String(seed).replace(/\s/g, '_').slice(0, 12);
  return `${prefix}${s}`.toUpperCase();
}

/**
 * Auto-detect best format and generate.
 * Returns { barcode, format }.
 */
export function generateBarcode(seed: number | string): { barcode: string; format: 'ean13' | 'code128' } {
  const numeric = String(seed).replace(/\D/g, '');
  // Use EAN-13 when seed is purely numeric, CODE128 otherwise
  if (numeric.length > 0 && numeric === String(seed).trim()) {
    return { barcode: generateEan13(Number(seed)), format: 'ean13' };
  }
  return { barcode: generateCode128(seed), format: 'code128' };
}

const QUOTE_REQUIRED = /[",\r\n]/;

/**
 * Encode one field for RFC 4180 output: wrap it in double quotes when it contains
 * a comma, a double quote, or a line break, and double any embedded quote. Every
 * other field passes through unchanged.
 */
function encodeField(value: string): string {
  if (!QUOTE_REQUIRED.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}

/** Serialize rows to RFC 4180 CSV text, one record per line, joined with CRLF. */
export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(encodeField).join(",")).join("\r\n");
}

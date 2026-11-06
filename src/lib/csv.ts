const QUOTE_REQUIRED = /[",\r\n]/;

/**
 * Encode one field for RFC 4180 output: wrap it in double quotes when it contains
 * a comma, a double quote, or a line break, and double any embedded quote. Text formula prefixes are made literal before quoting; numeric cells are unchanged.
 */
function encodeField(field: string | number): string {
  const value = typeof field === "number" ? String(field) :
    (/^[\s]*[=+@-]|^[\t\r\n]/.test(field) ? `'${field}` : field);
  if (!QUOTE_REQUIRED.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}

/** Serialize rows to RFC 4180 CSV text, one record per line, joined with CRLF. */
export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(encodeField).join(",")).join("\r\n");
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const EXPORT_DIR = "exports";

/** Restrict names to header-safe basenames on every supported platform. */
export function isValidExportFilename(filename: string): boolean {
  return filename.length > 0 && filename.length <= 200 &&
    /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(filename);
}

function exportPath(accountId: string, filename: string): string {
  if (!isValidExportFilename(filename)) {
    throw new TypeError("invalid export filename");
  }
  // A fixed-length account key cannot introduce path separators or collisions
  // between an account's name and another account's filename.
  const accountKey = createHash("sha256").update(accountId).digest("hex");
  return join(process.cwd(), EXPORT_DIR, accountKey, filename);
}

export async function saveExport(accountId: string, filename: string, csv: string): Promise<void> {
  const target = exportPath(accountId, filename);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, csv, "utf8");
}

export async function readExport(accountId: string, filename: string): Promise<string | null> {
  const target = exportPath(accountId, filename);
  try {
    return await readFile(target, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

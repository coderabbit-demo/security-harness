import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const EXPORT_DIR = "exports";

export async function saveExport(filename: string, csv: string): Promise<void> {
  const target = join(process.cwd(), EXPORT_DIR, filename);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, csv, "utf8");
}

export async function readExport(filename: string): Promise<string | null> {
  const target = join(process.cwd(), EXPORT_DIR, filename);
  try {
    return await readFile(target, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

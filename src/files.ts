import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

export type VspecConfig = {
  vspec_format: 1;
  key_prefix: string;
  spec_language?: "ko" | "en" | "match-input";
};

export function findConfigDir(start = process.cwd()): string | null {
  let current = resolve(start);
  while (true) {
    const candidate = join(current, ".vspec/config.json");
    if (existsSync(candidate)) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function readConfig(
  start = process.cwd(),
): { root: string; config: VspecConfig } | null {
  const root = findConfigDir(start);
  if (!root) return null;
  return {
    root,
    config: JSON.parse(readFileSync(join(root, ".vspec/config.json"), "utf8")),
  };
}

export function projectKey(start = process.cwd()): string | null {
  return readConfig(start)?.config.key_prefix ?? null;
}

// ⚡ Bolt: Use { withFileTypes: true } to avoid costly statSync calls per file
// Fallback to statSync only for symbolic links to correctly identify and follow linked directories
export function walkFiles(
  root: string,
  predicate: (path: string) => boolean,
): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    let isDir = entry.isDirectory();
    if (entry.isSymbolicLink()) {
      try {
        isDir = statSync(path).isDirectory();
      } catch {
        // Ignore broken symlinks
      }
    }
    if (isDir) files.push(...walkFiles(path, predicate));
    else if (predicate(path)) files.push(path);
  }
  return files.sort();
}

export function relativePath(path: string, from = process.cwd()): string {
  const rel = relative(from, path);
  return rel.length === 0 ? basename(path) : rel;
}

export function findUseCaseFile(root: string, key: string): string | null {
  const dir = join(root, "specs/usecases");
  const matches = walkFiles(
    dir,
    (path) => basename(path).startsWith(`${key}-`) && path.endsWith(".md"),
  );
  return matches[0] ?? null;
}

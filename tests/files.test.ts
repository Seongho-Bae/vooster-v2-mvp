import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { walkFiles } from "../src/files";

describe("walkFiles", () => {
  let root: string;

  beforeEach(() => {
    root = join(tmpdir(), `vspec-files-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("returns an empty array if the root directory does not exist", () => {
    const nonExistent = join(root, "non-existent");
    const result = walkFiles(nonExistent, () => true);
    expect(result).toEqual([]);
  });

  it("finds files matching the predicate in a flat directory", () => {
    writeFileSync(join(root, "a.txt"), "a");
    writeFileSync(join(root, "b.md"), "b");
    writeFileSync(join(root, "c.txt"), "c");

    const result = walkFiles(root, (path) => path.endsWith(".txt"));
    expect(result).toEqual([join(root, "a.txt"), join(root, "c.txt")]);
  });

  it("recursively finds files in nested directories", () => {
    mkdirSync(join(root, "nested", "deeply"), { recursive: true });
    writeFileSync(join(root, "a.txt"), "a");
    writeFileSync(join(root, "nested", "b.txt"), "b");
    writeFileSync(join(root, "nested", "deeply", "c.txt"), "c");
    writeFileSync(join(root, "nested", "d.md"), "d");

    const result = walkFiles(root, (path) => path.endsWith(".txt"));
    expect(result).toEqual([
      join(root, "a.txt"),
      join(root, "nested", "b.txt"),
      join(root, "nested", "deeply", "c.txt"),
    ]);
  });

  it("excludes files that do not match the predicate", () => {
    writeFileSync(join(root, "a.txt"), "a");
    writeFileSync(join(root, "b.md"), "b");

    const result = walkFiles(root, (path) => path.endsWith(".json"));
    expect(result).toEqual([]);
  });

  it("returns the results sorted", () => {
    mkdirSync(join(root, "z"), { recursive: true });
    mkdirSync(join(root, "a"), { recursive: true });
    writeFileSync(join(root, "z", "foo.txt"), "foo");
    writeFileSync(join(root, "a", "bar.txt"), "bar");
    writeFileSync(join(root, "file.txt"), "file");

    const result = walkFiles(root, () => true);
    expect(result).toEqual([
      join(root, "a", "bar.txt"),
      join(root, "file.txt"),
      join(root, "z", "foo.txt"),
    ]);
  });
});

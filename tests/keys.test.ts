import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { nextUseCaseKey, nextGoalId } from "../src/keys.js";

describe("keys generation", () => {
  let root: string;

  beforeEach(() => {
    root = join(tmpdir(), `vspec-keys-${crypto.randomUUID()}`);
    mkdirSync(root, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  describe("nextUseCaseKey", () => {
    it("returns 001 for an empty directory", () => {
      expect(nextUseCaseKey("UC", root)).toBe("UC-001");
    });

    it("increments the highest number", () => {
      writeFileSync(join(root, "UC-001-first.md"), "");
      writeFileSync(join(root, "UC-002-second.md"), "");
      expect(nextUseCaseKey("UC", root)).toBe("UC-003");
    });

    it("fills in gaps in numbers", () => {
      writeFileSync(join(root, "UC-001-first.md"), "");
      writeFileSync(join(root, "UC-003-third.md"), "");
      expect(nextUseCaseKey("UC", root)).toBe("UC-002");
    });

    it("ignores files not matching the prefix", () => {
      writeFileSync(join(root, "OTHER-001-first.md"), "");
      expect(nextUseCaseKey("UC", root)).toBe("UC-001");
    });

    it("ignores non-markdown files", () => {
      writeFileSync(join(root, "UC-001-first.txt"), "");
      expect(nextUseCaseKey("UC", root)).toBe("UC-001");
    });

    it("escapes regex characters in the prefix", () => {
      const prefix = "C++";
      writeFileSync(join(root, "C++-001-first.md"), "");
      expect(nextUseCaseKey(prefix, root)).toBe("C++-002");
    });
  });

  describe("nextGoalId", () => {
    it("returns G-001 for an empty directory", () => {
      expect(nextGoalId(root)).toBe("G-001");
    });

    it("increments the highest number", () => {
      writeFileSync(join(root, "G-001-first.md"), "");
      writeFileSync(join(root, "G-002-second.md"), "");
      expect(nextGoalId(root)).toBe("G-003");
    });

    it("fills in gaps in numbers", () => {
      writeFileSync(join(root, "G-001-first.md"), "");
      writeFileSync(join(root, "G-003-third.md"), "");
      expect(nextGoalId(root)).toBe("G-002");
    });

    it("ignores files not matching the pattern", () => {
      writeFileSync(join(root, "X-001-first.md"), "");
      writeFileSync(join(root, "G-ABC-first.md"), "");
      expect(nextGoalId(root)).toBe("G-001");
    });

    it("ignores non-markdown files", () => {
      writeFileSync(join(root, "G-001-first.txt"), "");
      expect(nextGoalId(root)).toBe("G-001");
    });
  });
});

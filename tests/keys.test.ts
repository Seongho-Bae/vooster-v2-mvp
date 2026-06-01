import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { nextUseCaseKey, nextGoalId } from "../src/keys.js";

describe("key allocation logic", () => {
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
      expect(nextUseCaseKey("VSPEC", root)).toBe("VSPEC-001");
    });

    it("returns the next sequence number when files exist", () => {
      writeFileSync(join(root, "VSPEC-001-first.md"), "");
      writeFileSync(join(root, "VSPEC-002-second.md"), "");
      expect(nextUseCaseKey("VSPEC", root)).toBe("VSPEC-003");
    });

    it("fills in gaps in the sequence", () => {
      writeFileSync(join(root, "VSPEC-001-first.md"), "");
      writeFileSync(join(root, "VSPEC-003-third.md"), "");
      expect(nextUseCaseKey("VSPEC", root)).toBe("VSPEC-002");
    });

    it("ignores unrelated files and extensions", () => {
      writeFileSync(join(root, "VSPEC-001-first.txt"), ""); // wrong extension
      writeFileSync(join(root, "OTHER-002-second.md"), ""); // wrong prefix
      writeFileSync(join(root, "VSPEC-ABC-third.md"), ""); // wrong number format
      writeFileSync(join(root, "VSPEC-004-fourth.md"), ""); // valid

      expect(nextUseCaseKey("VSPEC", root)).toBe("VSPEC-001");
    });

    it("escapes regex characters in prefix", () => {
      writeFileSync(join(root, "V+SPEC-001-first.md"), "");
      expect(nextUseCaseKey("V+SPEC", root)).toBe("V+SPEC-002");
    });
  });

  describe("nextGoalId", () => {
    it("returns G-001 for an empty directory", () => {
      expect(nextGoalId(root)).toBe("G-001");
    });

    it("returns the next sequence number when files exist", () => {
      writeFileSync(join(root, "G-001-first.md"), "");
      writeFileSync(join(root, "G-002-second.md"), "");
      expect(nextGoalId(root)).toBe("G-003");
    });

    it("fills in gaps in the sequence", () => {
      writeFileSync(join(root, "G-001-first.md"), "");
      writeFileSync(join(root, "G-003-third.md"), "");
      expect(nextGoalId(root)).toBe("G-002");
    });
  });
});

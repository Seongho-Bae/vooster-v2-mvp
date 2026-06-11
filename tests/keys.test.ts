import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { nextGoalId, nextUseCaseKey } from "../src/keys.js";

describe("keys", () => {
  let root: string;

  beforeEach(() => {
    root = join(tmpdir(), `vspec-keys-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  describe("nextGoalId", () => {
    it("returns G-001 for empty directory", () => {
      expect(nextGoalId(root)).toBe("G-001");
    });

    it("returns next sequence number for existing files", () => {
      writeFileSync(join(root, "G-001-test.md"), "");
      expect(nextGoalId(root)).toBe("G-002");
    });

    it("fills gaps in sequences", () => {
      writeFileSync(join(root, "G-001-test.md"), "");
      writeFileSync(join(root, "G-003-test.md"), "");
      expect(nextGoalId(root)).toBe("G-002");
    });

    it("ignores malformed files and non-md files", () => {
      writeFileSync(join(root, "G-001-test.txt"), ""); // Not .md
      writeFileSync(join(root, "FOO-002-test.md"), ""); // Wrong prefix
      writeFileSync(join(root, "G-abc-test.md"), ""); // Malformed number
      expect(nextGoalId(root)).toBe("G-001");
    });
  });

  describe("nextUseCaseKey", () => {
    it("returns <PREFIX>-001 for empty directory", () => {
      expect(nextUseCaseKey("APP", root)).toBe("APP-001");
    });

    it("returns next sequence number for existing files", () => {
      writeFileSync(join(root, "APP-001-test.md"), "");
      expect(nextUseCaseKey("APP", root)).toBe("APP-002");
    });

    it("fills gaps in sequences", () => {
      writeFileSync(join(root, "APP-001-test.md"), "");
      writeFileSync(join(root, "APP-003-test.md"), "");
      expect(nextUseCaseKey("APP", root)).toBe("APP-002");
    });

    it("escapes regex characters in prefix", () => {
      writeFileSync(join(root, "APP.X-001-test.md"), "");
      writeFileSync(join(root, "APP.X-002-test.md"), "");

      // Creating a file that could falsely match if '.' isn't escaped (e.g. APP-X-003-test.md)
      writeFileSync(join(root, "APP-X-003-test.md"), "");

      expect(nextUseCaseKey("APP.X", root)).toBe("APP.X-003");
    });

    it("ignores files for other prefixes", () => {
      writeFileSync(join(root, "APP-001-test.md"), "");
      writeFileSync(join(root, "WEB-001-test.md"), "");
      expect(nextUseCaseKey("WEB", root)).toBe("WEB-002");
    });
  });
});

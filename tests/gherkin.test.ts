import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { initProject } from "../src/project.js";
import { createUseCase } from "../src/usecase-commands.js";
import { tmpdir } from "node:os";
import { rmSync, mkdirSync } from "node:fs";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });

  describe("path validation", () => {
    let tmpRoot: string;

    beforeEach(() => {
      tmpRoot = join(tmpdir(), `vspec-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      mkdirSync(tmpRoot, { recursive: true });
    });

    afterEach(() => {
      rmSync(tmpRoot, { recursive: true, force: true });
    });

    it("rejects path traversal attempts that escape the project root", () => {
      initProject({ root: tmpRoot, key: "TEST" });
      createUseCase({ cwd: tmpRoot, title: "Test Path Traversal", primaryActor: "system" });

      expect(() => {
        exportGherkin({ cwd: tmpRoot, key: "TEST-001", output: "../../../../../../../../../../../../../../../../tmp/pwned.txt" });
      }).toThrowError("Export path escapes the project root.");
    });
  });
});

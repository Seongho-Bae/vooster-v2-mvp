import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { initProject } from "../src/project.js";
import { createUseCase } from "../src/usecase-commands.js";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });
});

describe("exportGherkin security", () => {
  let root: string;

  beforeEach(() => {
    root = join(tmpdir(), `vspec-test-${Math.random().toString(36).slice(2)}`);
    mkdirSync(root, { recursive: true });
    initProject({ root, key: "TEST" });
    createUseCase({ cwd: root, title: "test", primaryActor: "user" });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("prevents path traversal outside of project root", () => {
    const maliciousPath = "../../../../../../../../../../tmp/pwned.feature";

    expect(() => {
      exportGherkin({ cwd: root, key: "TEST-001", output: maliciousPath });
    }).toThrow(`Output path "${maliciousPath}" resolves outside of project root.`);
  });

  it("allows saving inside project root", () => {
    const validPath = "tests/test.feature";
    const result = exportGherkin({ cwd: root, key: "TEST-001", output: validPath });

    expect(result.path).toBe(validPath);
  });
});

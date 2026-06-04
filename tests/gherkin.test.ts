import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { initProject } from "../src/project.js";
import { createUseCase } from "../src/usecase-commands.js";
import { rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

describe("gherkin export", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = join(tmpdir(), `vspec-gherkin-test-${Date.now()}`);
    initProject({ root: cwd, key: "TEST" });
  });

  afterEach(() => {
    if (existsSync(cwd)) rmSync(cwd, { recursive: true, force: true });
  });

  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });

  it("prevents path traversal in output path", () => {
    const { key } = createUseCase({ cwd, title: "Traversal Test", primaryActor: "User" });
    expect(() => exportGherkin({ cwd, key, output: "../../../../../tmp/outside.feature" })).toThrow("Output path cannot traverse outside the workspace root");
  });
});

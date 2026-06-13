import { readFileSync } from "node:fs";
import { mkdirSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
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
    root = join(tmpdir(), `vspec-gherkin-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
    initProject({ root });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("prevents path traversal outside the project directory", () => {
    const { key } = createUseCase({ title: "Test Traversal", primaryActor: "user", cwd: root });
    expect(() => {
      exportGherkin({ key, output: "../../../../tmp/pwned.feature", cwd: root });
    }).toThrow(/Output path must be within the project root/);
  });
});

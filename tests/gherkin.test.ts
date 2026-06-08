import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { initProject } from "../src/project.js";
import { createUseCase } from "../src/usecase-commands.js";
import os from "node:os";
import crypto from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });
  it("throws INVALID_ARGUMENT when output path escapes project root", () => {
    const cwd = join(os.tmpdir(), crypto.randomUUID());
    mkdirSync(cwd, { recursive: true });
    initProject({ root: cwd, key: "TEST" });
    const { key } = createUseCase({ title: "test", primaryActor: "user", cwd });

    expect(() => exportGherkin({ key, output: "../../../../tmp/hacked.txt", cwd })).toThrowError(/must be inside the project root/);
    rmSync(cwd, { recursive: true, force: true });
  });
});

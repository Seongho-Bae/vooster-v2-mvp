import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { VspecError } from "../src/errors.js";

describe("gherkin export", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = join(tmpdir(), `vspec-test-${randomUUID()}`);
    mkdirSync(join(cwd, ".vspec"), { recursive: true });
    writeFileSync(join(cwd, ".vspec/config.json"), JSON.stringify({ vspec_format: 1, key_prefix: "TEST" }));
    mkdirSync(join(cwd, "specs/usecases"), { recursive: true });
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it("throws VspecError on path traversal outside project root", () => {
    writeFileSync(
      join(cwd, "specs/usecases/TEST-1-usecase.md"),
      `---
vspec_format: 1
type: usecase
key: TEST-1
title: Dummy
level: SUMMARY
format: CASUAL
status: DRAFT
priority: P1
scope: test
primary_actor: user
---
## Dummy
`
    );

    expect(() => exportGherkin({ key: "TEST-1", output: "../../../tmp/hacked.feature", cwd })).toThrowError(
      new VspecError("INVALID_ARGUMENT", 'Path traversal detected: output path "../../../tmp/hacked.feature" resolves outside the project root.')
    );
    expect(() => exportGherkin({ key: "TEST-1", output: "/tmp/hacked.feature", cwd })).toThrowError(
      new VspecError("INVALID_ARGUMENT", 'Path traversal detected: output path "/tmp/hacked.feature" resolves outside the project root.')
    );
  });

  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });
});

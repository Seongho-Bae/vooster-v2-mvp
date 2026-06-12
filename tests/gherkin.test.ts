import { readFileSync } from "node:fs";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
import { initProject } from "../src/project.js";
import { VspecError } from "../src/errors.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });

  it("prevents path traversal when exporting via CLI/API", () => {
    const root = join(tmpdir(), `vspec-traversal-test-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
    try {
      initProject({ root, key: "TEST" });
      mkdirSync(join(root, "specs/usecases"), { recursive: true });
      writeFileSync(join(root, "specs/usecases/TEST-001-test.md"), `---
vspec_format: 1
type: usecase
key: TEST-001
title: Test
scope: System
level: SUMMARY
primary_actor: system
status: DRAFT
priority: P1
format: CASUAL
---
## Main Success Scenario
1. system does a thing
## Success Guarantee
Something happens.
## Minimal Guarantee
Nothing happens.
`);

      expect(() => {
        exportGherkin({
          cwd: root,
          key: "TEST-001",
          output: "../../../../tmp/vspec-test-traversal-output.txt",
        });
      }).toThrowError(new VspecError("INVALID_ARGUMENT", "Output path must be inside the project root."));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(
      readFileSync(
        join(
          import.meta.dirname,
          "fixtures/export/VSPEC-010-export-gherkin.md",
        ),
        "utf8",
      ),
    );
    const expected = readFileSync(
      join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"),
      "utf8",
    );
    expect(renderGherkin(useCase)).toBe(expected);
  });

  it("prevents path traversal when exporting", () => {
    const project = createExportProject();

    try {
      expect(() =>
        exportGherkin({
          key: "VSPEC-010",
          output: "../../../../../tmp/pwned.feature",
          cwd: project,
        }),
      ).toThrow("INVALID_PATH");
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it("prevents symlink escapes when exporting", () => {
    const project = createExportProject();
    const outside = mkdtempSync(join(tmpdir(), "vspec-gherkin-outside-"));

    try {
      symlinkSync(outside, join(project, "linked-output"), "dir");

      expect(() =>
        exportGherkin({
          key: "VSPEC-010",
          output: "linked-output/pwned.feature",
          cwd: project,
        }),
      ).toThrow("INVALID_PATH");
      expect(existsSync(join(outside, "pwned.feature"))).toBe(false);
    } finally {
      rmSync(project, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

function createExportProject(): string {
  const project = mkdtempSync(join(tmpdir(), "vspec-gherkin-project-"));
  mkdirSync(join(project, ".vspec"), { recursive: true });
  mkdirSync(join(project, "specs/usecases"), { recursive: true });
  writeFileSync(
    join(project, ".vspec/config.json"),
    JSON.stringify({ vspec_format: 1, key_prefix: "VSPEC" }),
  );
  writeFileSync(
    join(project, "specs/usecases/VSPEC-010-export-gherkin.md"),
    readFileSync(
      join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"),
      "utf8",
    ),
  );
  return project;
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
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

  describe("exportGherkin path traversal prevention", () => {
    it("throws an error when output path is outside root via relative string", () => {
      const cwd = join(import.meta.dirname, "fixtures/doctor/clean");
      expect(() =>
        exportGherkin({ key: "VSPEC-001", output: "../evil.feature", cwd }),
      ).toThrowError("PATH_TRAVERSAL_DETECTED");
    });

    it("throws an error when output path is outside root via absolute string", () => {
      const cwd = join(import.meta.dirname, "fixtures/doctor/clean");
      expect(() =>
        exportGherkin({ key: "VSPEC-001", output: "/tmp/evil.feature", cwd }),
      ).toThrowError("PATH_TRAVERSAL_DETECTED");
    });
  });
});

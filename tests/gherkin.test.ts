import { readFileSync } from "node:fs";
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
    expect(() =>
      exportGherkin({
        key: "VSPEC-010",
        output: "../../../../../tmp/pwned.feature",
        cwd: join(import.meta.dirname, "fixtures/export"),
      }),
    ).toThrow("INVALID_PATH");
  });
});

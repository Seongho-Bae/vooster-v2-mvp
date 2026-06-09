import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { VspecError } from "../src/errors.js";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });

  it("prevents path traversal vulnerabilities", () => {
    // VSPEC-001 is present in the mock project root (tests/fixtures/doctor/clean) so it would succeed
    // if not for the traversal in the --output path.
    const cwd = join(import.meta.dirname, "fixtures/doctor/clean");
    expect(() =>
      exportGherkin({ key: "VSPEC-001", output: "../../../tmp/hacked.feature", cwd })
    ).toThrowError(new VspecError("INVALID_ARGUMENT", "Output path must be within the project root."));
  });
});

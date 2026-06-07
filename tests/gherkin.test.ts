import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderGherkin, exportGherkin } from "../src/export/gherkin.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { VspecError } from "../src/errors.js";

describe("gherkin export", () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = join(tmpdir(), `vspec-gherkin-${crypto.randomUUID()}`);
    mkdirSync(tempRoot, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

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

  it("throws VspecError on path traversal attempt", () => {
    mkdirSync(join(tempRoot, ".vspec"), { recursive: true });
    writeFileSync(
      join(tempRoot, ".vspec/config.json"),
      '{"vspec_format": 1, "key_prefix": "VSPEC"}',
    );
    mkdirSync(join(tempRoot, "specs/usecases"), { recursive: true });

    // Copy the golden fixture to the temp dir so exportGherkin can read it
    const md = readFileSync(
      join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"),
      "utf8",
    );
    writeFileSync(
      join(tempRoot, "specs/usecases/VSPEC-010-export-gherkin.md"),
      md,
    );

    expect(() => {
      exportGherkin({
        key: "VSPEC-010",
        output: "../../../etc/passwd",
        cwd: tempRoot,
      });
    }).toThrowError(
      new VspecError("INVALID_ARGUMENT", "Path traversal detected"),
    );
  });
});

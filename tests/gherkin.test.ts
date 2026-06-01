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
    expect(() =>
      exportGherkin({
        key: "VSPEC-010",
        output: "../../../../../tmp/pwned.feature",
        cwd: join(import.meta.dirname, "fixtures/export"),
      }),
    ).toThrow("INVALID_PATH");
  });

  it("prevents symlink escape when exporting", () => {
    const root = mkdtempSync(join(tmpdir(), "vspec-gherkin-root-"));
    const outside = mkdtempSync(join(tmpdir(), "vspec-gherkin-outside-"));
    try {
      mkdirSync(join(root, ".vspec"), { recursive: true });
      mkdirSync(join(root, "specs/usecases"), { recursive: true });
      writeFileSync(
        join(root, ".vspec/config.json"),
        JSON.stringify({ vspec_format: 1, key_prefix: "VSPEC" }),
      );
      writeFileSync(
        join(root, "specs/usecases/VSPEC-010-export-gherkin.md"),
        readFileSync(
          join(
            import.meta.dirname,
            "fixtures/export/VSPEC-010-export-gherkin.md",
          ),
          "utf8",
        ),
      );
      symlinkSync(outside, join(root, "outside-link"), "dir");

      expect(() =>
        exportGherkin({
          key: "VSPEC-010",
          output: "outside-link/pwned.feature",
          cwd: root,
        }),
      ).toThrow("INVALID_PATH");
      expect(existsSync(join(outside, "pwned.feature"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

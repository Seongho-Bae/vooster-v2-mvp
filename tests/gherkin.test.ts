import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { exportGherkin, renderGherkin } from "../src/export/gherkin.js";
import { initProject } from "../src/project.js";
import { createUseCase } from "../src/usecase-commands.js";
import { VspecError } from "../src/errors.js";
import { parseUseCaseMarkdown } from "../src/format/parse.js";

describe("gherkin export", () => {
  it("renders the golden feature byte-for-byte", () => {
    const useCase = parseUseCaseMarkdown(readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010-export-gherkin.md"), "utf8"));
    const expected = readFileSync(join(import.meta.dirname, "fixtures/export/VSPEC-010.feature"), "utf8");
    expect(renderGherkin(useCase)).toBe(expected);
  });

  describe("exportGherkin path traversal prevention", () => {
    let tmp: string;

    beforeEach(() => {
      tmp = join(tmpdir(), `vspec-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      mkdirSync(tmp, { recursive: true });
      initProject({ root: tmp, key: "TEST" });
      createUseCase({ title: "Test Use Case", primaryActor: "user", cwd: tmp });
    });

    afterEach(() => {
      rmSync(tmp, { recursive: true, force: true });
    });

    it("prevents exporting to a path outside the project root", () => {
      expect(() => {
        exportGherkin({ key: "TEST-001", output: "../../../../../tmp/hacked.txt", cwd: tmp });
      }).toThrowError(VspecError);

      expect(() => {
        exportGherkin({ key: "TEST-001", output: "../../../../../tmp/hacked.txt", cwd: tmp });
      }).toThrowError(/resolves outside the project root/);
    });

    it("prevents exporting to an absolute path outside the project root", () => {
      expect(() => {
        exportGherkin({ key: "TEST-001", output: "/etc/passwd", cwd: tmp });
      }).toThrowError(VspecError);

      expect(() => {
        exportGherkin({ key: "TEST-001", output: "/etc/passwd", cwd: tmp });
      }).toThrowError(/resolves outside the project root/);
    });

    it("allows exporting to a valid path inside the project root", () => {
      const result = exportGherkin({ key: "TEST-001", output: "tests/my-feature.feature", cwd: tmp });
      expect(result.path).toBe("tests/my-feature.feature");
    });
  });
});

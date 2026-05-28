import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseUseCaseMarkdown } from "../src/format/parse.js";
import { normalizeUseCaseMarkdown } from "../src/format/normalize.js";
import { serializeUseCase } from "../src/format/serialize.js";

const fixtureDir = join(import.meta.dirname, "fixtures/usecases");
const fixtures = [
  "minimal.md",
  "fully-dressed.md",
  "multiple-extensions.md",
  "any-step-extension.md",
  "out-of-order-sections.md",
  "non-contiguous-steps.md",
  "context-blurb.md",
  "notes.md",
];

describe("use-case markdown round trip", () => {
  it.each(fixtures)("%s serializes to normalized form", (fixture) => {
    const file = readFileSync(join(fixtureDir, fixture), "utf8");
    const parsed = parseUseCaseMarkdown(file);
    expect(serializeUseCase(parsed)).toBe(normalizeUseCaseMarkdown(file));
  });

  it.each(fixtures)("%s normalization is idempotent", (fixture) => {
    const file = readFileSync(join(fixtureDir, fixture), "utf8");
    const normalized = normalizeUseCaseMarkdown(file);
    expect(normalizeUseCaseMarkdown(normalized), basename(fixture)).toBe(normalized);
  });
});

import { describe, expect, it } from "vitest";
import { errorInfo } from "../src/output.js";
import { VspecError } from "../src/errors.js";
import { ZodError } from "zod";

describe("errorInfo", () => {
  it("handles VspecError with custom actions", () => {
    const error = new VspecError("CUSTOM_ERROR", "Custom detail", [
      { command: "foo", reason: "bar" },
    ]);
    expect(errorInfo(error)).toEqual({
      code: "CUSTOM_ERROR",
      message: "Custom detail",
      actions: [{ command: "foo", reason: "bar" }],
    });
  });

  it("handles VspecError without custom actions falling back to defaultActions", () => {
    const error = new VspecError("KEY_NOT_FOUND", "Custom detail");
    expect(errorInfo(error)).toEqual({
      code: "KEY_NOT_FOUND",
      message: "Custom detail",
      actions: [
        { command: "vspec usecase list", reason: "See available keys." },
      ],
    });
  });

  it("handles ZodError with fields", () => {
    const error = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["frontmatter", "title"],
        message: "err",
      } as any,
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["frontmatter", "title"],
        message: "err",
      } as any,
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["body"],
        message: "err",
      } as any,
    ]);
    const info = errorInfo(error);
    expect(info.code).toBe("INVALID_FRONTMATTER");
    expect(info.message).toBe(
      "Frontmatter is invalid: frontmatter.title, body. Fix the field(s) so it matches the schema and re-run.",
    );
    expect(info.actions).toEqual([
      {
        command: "vspec ai-guide",
        reason: "Review the required frontmatter fields and valid enum values.",
      },
    ]);
  });

  it("handles ZodError without fields", () => {
    const error = new ZodError([{ code: "custom", path: [], message: "err" }]);
    const info = errorInfo(error);
    expect(info.code).toBe("INVALID_FRONTMATTER");
    expect(info.message).toBe(
      "Frontmatter does not match the use-case schema.",
    );
  });

  it("handles specific Error string codes: NOT_INITIALIZED", () => {
    expect(errorInfo(new Error("NOT_INITIALIZED"))).toEqual({
      code: "NOT_INITIALIZED",
      message: "No .vspec/config.json found.",
      actions: [{ command: "vspec init", reason: "Initialize this repo." }],
    });
  });

  it("handles specific Error string codes: KEY_NOT_FOUND", () => {
    expect(errorInfo(new Error("KEY_NOT_FOUND"))).toEqual({
      code: "KEY_NOT_FOUND",
      message: "No use case found for that key.",
      actions: [
        { command: "vspec usecase list", reason: "See available keys." },
      ],
    });
  });

  it("handles specific Error string codes: ACTOR_NOT_FOUND", () => {
    expect(errorInfo(new Error("ACTOR_NOT_FOUND"))).toEqual({
      code: "ACTOR_NOT_FOUND",
      message: "No actor found for that name.",
      actions: [
        { command: "vspec actor list", reason: "See available actors." },
      ],
    });
  });

  it("handles specific Error string codes: STAKEHOLDER_NOT_FOUND", () => {
    expect(errorInfo(new Error("STAKEHOLDER_NOT_FOUND"))).toEqual({
      code: "STAKEHOLDER_NOT_FOUND",
      message: "No stakeholder found for that name.",
      actions: [
        {
          command: "vspec stakeholder list",
          reason: "See available stakeholders.",
        },
      ],
    });
  });

  it("handles specific Error string codes: GOAL_NOT_FOUND", () => {
    expect(errorInfo(new Error("GOAL_NOT_FOUND"))).toEqual({
      code: "GOAL_NOT_FOUND",
      message: "No goal found for that id.",
      actions: [{ command: "vspec goal list", reason: "See available goals." }],
    });
  });

  it("handles specific Error string codes: ALREADY_EXISTS", () => {
    expect(errorInfo(new Error("ALREADY_EXISTS"))).toEqual({
      code: "ALREADY_EXISTS",
      message: "The target file already exists.",
      actions: [{ command: "vspec doctor", reason: "Inspect current specs." }],
    });
  });

  it("handles generic Error falling back to INVALID_ARGUMENT", () => {
    expect(errorInfo(new Error("UNKNOWN_ERROR"))).toEqual({
      code: "INVALID_ARGUMENT",
      message: "UNKNOWN_ERROR",
      actions: [{ command: "vspec ai-guide", reason: "Review command usage." }],
    });
  });

  it("handles non-Error objects (strings, etc) falling back to INVALID_ARGUMENT", () => {
    expect(errorInfo("SOME_STRING")).toEqual({
      code: "INVALID_ARGUMENT",
      message: "INVALID_ARGUMENT",
      actions: [{ command: "vspec ai-guide", reason: "Review command usage." }],
    });
  });
});

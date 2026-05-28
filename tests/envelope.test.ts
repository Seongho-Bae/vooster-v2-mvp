import { describe, expect, it } from "vitest";
import { buildErrorEnvelope, buildOkEnvelope } from "../src/envelope.js";

describe("agent envelope builders", () => {
  it("builds ok envelopes with documented defaults", () => {
    expect(buildOkEnvelope({ data: { key: "VSPEC-001" } })).toEqual({
      format_version: 1,
      status: "ok",
      data: { key: "VSPEC-001" },
      context: { project_key: null },
      affected_files: [],
      dry_run: false,
      suggested_next_actions: [],
      warnings: [],
    });
  });

  it("builds error envelopes with stable error payloads", () => {
    expect(
      buildErrorEnvelope({
        error: { code: "KEY_NOT_FOUND", message: "No use case with key VSPEC-404." },
        context: { project_key: "VSPEC" },
        suggestedNextActions: [{ command: "vspec usecase list" }],
      }),
    ).toEqual({
      format_version: 1,
      status: "error",
      data: null,
      error: { code: "KEY_NOT_FOUND", message: "No use case with key VSPEC-404." },
      context: { project_key: "VSPEC" },
      affected_files: [],
      dry_run: false,
      suggested_next_actions: [{ command: "vspec usecase list" }],
      warnings: [],
    });
  });
});

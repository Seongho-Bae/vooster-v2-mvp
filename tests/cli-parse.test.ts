import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { z } from "zod";

const envelopeSchema = z.object({
  format_version: z.literal(1),
  status: z.enum(["ok", "error"]),
  data: z.unknown().nullable(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  context: z.object({ project_key: z.string().nullable() }),
  affected_files: z.array(z.object({ path: z.string() })),
  dry_run: z.boolean(),
  suggested_next_actions: z
    .array(z.object({ command: z.string(), reason: z.string().optional() }))
    .min(1),
  warnings: z.array(z.object({ message: z.string() })),
});

describe("CLI parse error handling", () => {
  const repoRoot = resolve(import.meta.dirname, "..");
  const tsx = join(repoRoot, "node_modules/.bin/tsx");
  const cli = join(repoRoot, "src/cli.ts");

  it("suppresses stderr and catches parse errors", () => {
    let stdout = "";
    let stderr = "";
    try {
      execFileSync(tsx, [cli, "--unknown-option"], { encoding: "utf8" });
      throw new Error("Expected command to fail");
    } catch (e: any) {
      stdout = e.stdout;
      stderr = e.stderr;
    }

    // Verify stderr is empty (writeErr suppressed)
    expect(stderr.trim()).toBe("");

    // Verify stdout contains the correctly mapped envelope
    const envelope = envelopeSchema.parse(JSON.parse(stdout));
    expect(envelope.status).toBe("error");
    expect(envelope.error?.code).toBe("INVALID_ARGUMENT");
    expect(envelope.error?.message).toContain(
      "unknown option '--unknown-option'",
    );
  });

  it("returns early without an error envelope on help", () => {
    // execFileSync should not throw because --help exits with 0
    const stdout = execFileSync(tsx, [cli, "--help"], { encoding: "utf8" });

    expect(stdout).toContain("Usage:");
    expect(stdout).not.toContain('"status":"error"');
  });

  it("returns early without an error envelope on version", () => {
    // execFileSync should not throw because --version exits with 0
    const stdout = execFileSync(tsx, [cli, "--version"], { encoding: "utf8" });

    expect(stdout.trim()).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
    expect(stdout).not.toContain('"status":"error"');
  });
});

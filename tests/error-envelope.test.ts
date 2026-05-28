import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "..");
const tsx = join(repoRoot, "node_modules/.bin/tsx");
const cli = join(repoRoot, "src/cli.ts");

function runExpectingError(root: string, args: string[]): string {
  try {
    execFileSync(tsx, [cli, ...args, "--format", "agent"], { cwd: root, encoding: "utf8" });
    throw new Error("expected command to fail");
  } catch (error) {
    return (error as { stdout: Buffer }).stdout.toString();
  }
}

describe("error envelopes for invalid files", () => {
  it("maps a bad frontmatter enum to INVALID_FRONTMATTER instead of leaking a raw Zod array", () => {
    const root = join(tmpdir(), `vspec-err-${crypto.randomUUID()}`);
    mkdirSync(join(root, "specs/usecases"), { recursive: true });
    mkdirSync(join(root, "specs/actors"), { recursive: true });
    execFileSync(tsx, [cli, "init", "--key", "VSPEC"], { cwd: root });
    // `status: READY` is not a valid enum value — the file is corrupt on load.
    writeFileSync(
      join(root, "specs/usecases/VSPEC-001-broken.md"),
      `---
vspec_format: 1
type: usecase
key: VSPEC-001
title: 무언가를 작성한다
level: USER_GOAL
format: BRIEF
status: READY
priority: P1
scope: vspec
primary_actor: developer
---
# 무언가를 작성한다
`,
    );

    const stdout = runExpectingError(root, ["usecase", "show", "VSPEC-001"]);
    const envelope = JSON.parse(stdout) as {
      status: string;
      error?: { code: string; message: string };
      suggested_next_actions: { command: string }[];
    };

    expect(envelope.status).toBe("error");
    expect(envelope.error?.code).toBe("INVALID_FRONTMATTER");
    // The message must be human-readable, not a dumped JSON issues array.
    expect(envelope.error?.message.startsWith("[")).toBe(false);
    expect(envelope.error?.message).toContain("status");
    expect(envelope.suggested_next_actions.length).toBeGreaterThan(0);

    rmSync(root, { recursive: true, force: true });
  });
});

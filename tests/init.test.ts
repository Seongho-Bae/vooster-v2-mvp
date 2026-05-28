import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "..");
const tsx = join(repoRoot, "node_modules/.bin/tsx");
const cli = join(repoRoot, "src/cli.ts");

let root: string;
const config = () => JSON.parse(readFileSync(join(root, ".vspec/config.json"), "utf8"));

function run(...args: string[]) {
  return JSON.parse(execFileSync(tsx, [cli, ...args], { cwd: root, encoding: "utf8" }));
}
function expectError(...args: string[]) {
  try {
    execFileSync(tsx, [cli, ...args], { cwd: root, encoding: "utf8" });
    throw new Error("expected command to fail");
  } catch (error) {
    return JSON.parse((error as { stdout: Buffer }).stdout.toString());
  }
}

describe("init key prefix on re-init", () => {
  beforeEach(() => {
    root = join(tmpdir(), `vspec-init-${crypto.randomUUID()}`);
    mkdirSync(root, { recursive: true });
    run("init", "--key", "VSPEC");
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("rejects a different key and keeps the stored prefix", () => {
    const env = expectError("init", "--key", "OTHER");
    expect(env.error.code).toBe("ALREADY_INITIALIZED");
    expect(env.error.message).toContain("VSPEC");
    expect(config().key_prefix).toBe("VSPEC");
  });

  it("is idempotent without --key", () => {
    expect(run("init").status).toBe("ok");
    expect(config().key_prefix).toBe("VSPEC");
  });

  it("accepts the same key case-insensitively", () => {
    expect(run("init", "--key", "vspec").status).toBe("ok");
    expect(config().key_prefix).toBe("VSPEC");
  });
});

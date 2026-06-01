import { describe, expect, it, vi, afterEach } from "vitest";
import { run } from "../src/cli.js";

describe("CLI parse error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("suppresses writeErr and exitOverride works as expected when unknown options are provided", async () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Call run() with an unknown option which would normally cause commander to exit and write to stderr
    await run(["node", "vspec", "--unknown-option-xyz"]);

    // Ensure stderr and console.error were not written to
    expect(stderrSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // The error should be caught by our top-level catch in run(), which calls outputError()
    // outputError uses console.log to print a JSON envelope.
    expect(consoleLogSpy).toHaveBeenCalled();

    const output = consoleLogSpy.mock.calls.map(call => call[0]).join("\n");
    const envelope = JSON.parse(output);

    expect(envelope.status).toBe("error");
    expect(envelope.error.code).toBe("INVALID_ARGUMENT");
    expect(envelope.error.message).toContain("unknown option '--unknown-option-xyz'");
  });
});

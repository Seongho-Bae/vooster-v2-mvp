import { describe, expect, it, vi } from "vitest";
import { run } from "../src/cli.js";
import { Command } from "commander";
import * as output from "../src/output.js";

vi.mock("../src/output.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../src/output.js")>();
  return {
    ...mod,
    outputError: vi.fn(),
  };
});

describe("run() CLI entrypoint", () => {
  it("catches parse errors, suppresses stderr, and outputs them as an agent envelope", async () => {
    const stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    await run(["node", "cli.js", "init", "--unknown-option"]);

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(output.outputError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "INVALID_ARGUMENT",
        message: expect.stringContaining("unknown option"),
      }),
    );

    stderrSpy.mockRestore();
  });

  it("handles empty error messages by falling back to a default", async () => {
    const mockExitError = new Error() as any;
    mockExitError.code = "commander.unknownOption";
    mockExitError.message = undefined;

    const programParseSpy = vi
      .spyOn(Command.prototype, "parseAsync")
      .mockRejectedValue(mockExitError);

    await run(["node", "cli.js", "unknown-command"]);

    expect(output.outputError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "INVALID_ARGUMENT",
        message: "Invalid command invocation.",
        actions: [
          {
            command: "vspec ai-guide",
            reason: "Review command usage and valid options.",
          },
        ],
      }),
    );

    programParseSpy.mockRestore();
  });
});

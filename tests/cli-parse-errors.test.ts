import { Command, CommanderError } from "commander";
import { describe, expect, it, vi } from "vitest";
import { catchParseErrors } from "../src/cli.js";

describe("catchParseErrors", () => {
  it("suppresses stderr and forces parse errors to throw", async () => {
    const program = new Command();
    program.command("sub");

    // Catch process.stderr to make sure no errors are printed
    const writeErrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    catchParseErrors(program);

    try {
      await program.parseAsync(["node", "test", "unknown-command"]);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CommanderError);
      expect((err as CommanderError).code).toBe("commander.unknownCommand");
      // Since we suppressed it in catchParseErrors via command.configureOutput({ writeErr: () => {} }),
      // process.stderr.write should not have been called.
      expect(writeErrSpy).not.toHaveBeenCalled();
    } finally {
      writeErrSpy.mockRestore();
    }
  });

  it("applies recursively to subcommands", async () => {
    const program = new Command();
    const sub = program.command("sub");
    const subsub = sub.command("subsub");

    catchParseErrors(program);

    try {
      await program.parseAsync([
        "node",
        "test",
        "sub",
        "subsub",
        "--unknown-flag",
      ]);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CommanderError);
      expect((err as CommanderError).code).toBe("commander.unknownOption");
    }
  });
});

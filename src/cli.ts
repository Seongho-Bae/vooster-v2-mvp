#!/usr/bin/env node
import { Command } from "commander";

export function buildProgram(): Command {
  const program = new Command();
  program
    .name("vspec")
    .description("Local-first Cockburn use-case specs")
    .version("0.1.0")
    .option("--format <format>", "output format: human|json|agent", "human");

  program
    .command("doctor")
    .description("Validate specs offline")
    .argument("[target]", "use-case key or path")
    .action(() => {
      console.log("doctor command is not implemented yet");
    });

  return program;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildProgram().parseAsync(process.argv);
}

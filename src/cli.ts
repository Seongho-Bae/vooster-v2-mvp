#!/usr/bin/env node
import { Command } from "commander";
import { runDoctor } from "./validate/doctor.js";
import { buildErrorEnvelope, buildOkEnvelope } from "./envelope.js";
import { projectKey } from "./files.js";

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
    .action((target: string | undefined) => {
      const format = program.opts().format as "human" | "json" | "agent";
      const result = runDoctor({ target });
      const errors = result.findings.filter((finding) => finding.level === "error");
      const warnings = result.findings.filter((finding) => finding.level === "warn");
      const data = { files: result.files, findings: result.findings };

      if (format === "agent") {
        if (errors.length > 0) {
          console.log(
            JSON.stringify(
              buildErrorEnvelope({
                error: {
                  code: "VALIDATION_FAILED",
                  message: `${errors.length} validation error(s).`,
                  details: { findings: result.findings },
                },
                context: { project_key: projectKey() },
                suggestedNextActions: suggestDoctorActions(result.findings),
                warnings: warnings.map((finding) => ({ message: finding.message })),
              }),
              null,
              2,
            ),
          );
          process.exitCode = 1;
          return;
        }
        console.log(
          JSON.stringify(
            buildOkEnvelope({
              data,
              context: { project_key: projectKey() },
              suggestedNextActions: [{ command: "vspec export gherkin <KEY>", reason: "Export validated use cases." }],
              warnings: warnings.map((finding) => ({ message: finding.message })),
            }),
            null,
            2,
          ),
        );
        return;
      }

      if (format === "json") {
        console.log(JSON.stringify(data, null, 2));
      } else if (errors.length === 0) {
        console.log(`No errors. ${warnings.length} warning(s).`);
      } else {
        for (const finding of result.findings) {
          console.error(`${finding.level.toUpperCase()} ${finding.rule}: ${finding.message}`);
        }
      }
      if (errors.length > 0) process.exitCode = 1;
    });

  return program;
}

function suggestDoctorActions(findings: { rule: string; message: string }[]) {
  const actions = [{ command: "vspec doctor", reason: "Re-run validation after fixes." }];
  for (const finding of findings) {
    const actor = finding.message.match(/Actor (.+?) (?:in step|does not exist)/)?.[1];
    if (actor) actions.unshift({ command: `vspec actor create --name ${actor}`, reason: "Create the missing actor." });
    const stakeholder = finding.message.match(/Stakeholder (.+?) does not exist/)?.[1];
    if (stakeholder) {
      actions.unshift({
        command: `vspec stakeholder create --name ${stakeholder.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        reason: "Create the missing stakeholder.",
      });
    }
  }
  return actions;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildProgram().parseAsync(process.argv);
}

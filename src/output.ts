import { ZodError } from "zod";
import { buildErrorEnvelope, buildOkEnvelope } from "./envelope.js";
import { projectKey } from "./files.js";
import { VspecError } from "./errors.js";
import type { AgentAction } from "./domain/types.js";

export type CommandPayload<T> = {
  data: T;
  affectedFiles?: { path: string }[];
  suggestedNextActions: AgentAction[];
  warnings?: { message: string }[];
};

// vspec speaks one language to its only user, the agent: the JSON envelope. There
// is no --format; every command prints the envelope on stdout so output is always
// machine-parseable and self-teaching.
export function outputSuccess<T>(payload: CommandPayload<T>) {
  console.log(
    JSON.stringify(
      buildOkEnvelope({
        data: payload.data,
        context: { project_key: projectKey() },
        affectedFiles: payload.affectedFiles ?? inferAffectedFiles(payload.data),
        suggestedNextActions: payload.suggestedNextActions,
        warnings: payload.warnings ?? [],
      }),
      null,
      2,
    ),
  );
}

export function outputError(args: { code: string; message: string; details?: Record<string, unknown>; actions?: AgentAction[] }) {
  console.log(
    JSON.stringify(
      buildErrorEnvelope({
        error: { code: args.code, message: args.message, details: args.details },
        context: { project_key: projectKey() },
        suggestedNextActions: args.actions ?? defaultActions(args.code),
      }),
      null,
      2,
    ),
  );
  process.exitCode = 1;
}

export function errorInfo(error: unknown): { code: string; message: string; details?: Record<string, unknown>; actions: AgentAction[] } {
  if (error instanceof VspecError) {
    return { code: error.code, message: error.detail, actions: error.actions ?? defaultActions(error.code) };
  }
  if (error instanceof ZodError) {
    const fields = [...new Set(error.issues.map((issue) => issue.path.join(".")).filter(Boolean))].join(", ");
    return {
      code: "INVALID_FRONTMATTER",
      message: fields
        ? `Frontmatter is invalid: ${fields}. Fix the field(s) so it matches the schema and re-run.`
        : "Frontmatter does not match the use-case schema.",
      details: { issues: error.issues },
      actions: [{ command: "vspec ai-guide", reason: "Review the required frontmatter fields and valid enum values." }],
    };
  }
  const code = error instanceof Error ? error.message : "INVALID_ARGUMENT";
  if (code === "NOT_INITIALIZED") {
    return { code, message: "No .vspec/config.json found.", actions: [{ command: "vspec init", reason: "Initialize this repo." }] };
  }
  if (code === "KEY_NOT_FOUND") {
    return { code, message: "No use case found for that key.", actions: [{ command: "vspec usecase list", reason: "See available keys." }] };
  }
  if (code === "ACTOR_NOT_FOUND") {
    return { code, message: "No actor found for that name.", actions: [{ command: "vspec actor list", reason: "See available actors." }] };
  }
  if (code === "STAKEHOLDER_NOT_FOUND") {
    return {
      code,
      message: "No stakeholder found for that name.",
      actions: [{ command: "vspec stakeholder list", reason: "See available stakeholders." }],
    };
  }
  if (code === "GOAL_NOT_FOUND") {
    return { code, message: "No goal found for that id.", actions: [{ command: "vspec goal list", reason: "See available goals." }] };
  }
  if (code === "ALREADY_EXISTS") {
    return { code, message: "The target file already exists.", actions: [{ command: "vspec doctor", reason: "Inspect current specs." }] };
  }
  return { code: "INVALID_ARGUMENT", message: code, actions: [{ command: "vspec ai-guide", reason: "Review command usage." }] };
}

function inferAffectedFiles(data: unknown): { path: string }[] {
  if (data && typeof data === "object") {
    const record = data as { path?: unknown; affectedFiles?: unknown };
    if (Array.isArray(record.affectedFiles)) return record.affectedFiles.map((path) => ({ path: String(path) }));
    if (typeof record.path === "string") return [{ path: record.path }];
  }
  return [];
}

function defaultActions(code: string): AgentAction[] {
  if (code === "KEY_NOT_FOUND") return [{ command: "vspec usecase list", reason: "See available keys." }];
  return [{ command: "vspec ai-guide", reason: "See the end-to-end workflow." }];
}

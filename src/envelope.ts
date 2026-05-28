import type { AgentAction, AgentEnvelope } from "./domain/types.js";

type EnvelopeContext = { project_key: string | null };
type Warning = { message: string };

export function buildOkEnvelope<TData>(args: {
  data: TData;
  context?: Partial<EnvelopeContext>;
  affectedFiles?: { path: string }[];
  dryRun?: boolean;
  suggestedNextActions?: AgentAction[];
  warnings?: Warning[];
}): AgentEnvelope<TData> {
  return {
    format_version: 1,
    status: "ok",
    data: args.data,
    context: { project_key: args.context?.project_key ?? null },
    affected_files: args.affectedFiles ?? [],
    dry_run: args.dryRun ?? false,
    suggested_next_actions: args.suggestedNextActions ?? [],
    warnings: args.warnings ?? [],
  };
}

export function buildErrorEnvelope(args: {
  error: { code: string; message: string; details?: Record<string, unknown> };
  context?: Partial<EnvelopeContext>;
  suggestedNextActions?: AgentAction[];
  warnings?: Warning[];
}): AgentEnvelope<null> {
  return {
    format_version: 1,
    status: "error",
    data: null,
    error: args.error,
    context: { project_key: args.context?.project_key ?? null },
    affected_files: [],
    dry_run: false,
    suggested_next_actions: args.suggestedNextActions ?? [],
    warnings: args.warnings ?? [],
  };
}

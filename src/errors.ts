import type { AgentAction } from "./domain/types.js";

/**
 * A CLI error carrying a stable machine code plus a human-readable detail and
 * optional recovery actions. Throwing this (instead of `new Error("CODE")`)
 * lets the output layer emit a useful envelope: `error.message` stays
 * actionable instead of collapsing back to the bare code.
 */
export class VspecError extends Error {
  readonly code: string;
  readonly detail: string;
  readonly actions?: AgentAction[];

  constructor(code: string, detail?: string, actions?: AgentAction[]) {
    super(detail ?? code);
    this.name = "VspecError";
    this.code = code;
    this.detail = detail ?? code;
    this.actions = actions;
  }
}

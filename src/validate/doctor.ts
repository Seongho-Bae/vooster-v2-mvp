import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { statSync } from "node:fs";
import { ZodError } from "zod";
import { parseMatter, parseStakeholderFrontmatter } from "../format/frontmatter.js";
import { parseUseCaseMarkdown } from "../format/parse.js";
import { displayToSlug } from "../slug.js";
import { findUseCaseFile, relativePath, walkFiles } from "../files.js";
import type { ParsedUseCase } from "../domain/types.js";

export type Finding = {
  rule: string;
  level: "error" | "warn";
  message: string;
  location?: string;
};

export type DoctorResult = {
  findings: Finding[];
  files: string[];
};

export function runDoctor(args: { root?: string; target?: string }): DoctorResult {
  const root = resolve(args.root ?? process.cwd());
  const files = resolveTargets(root, args.target);
  const findings: Finding[] = [];
  const stakeholderRefs = readStakeholderRefs(root);

  if (args.target && files.length === 0) {
    return {
      files: [],
      findings: [
        {
          rule: "key-found",
          level: "error",
          message: `No use case with key or path ${args.target}.`,
          location: args.target,
        },
      ],
    };
  }

  for (const file of files) {
    const location = relativePath(file, root);
    let parsed: ParsedUseCase;
    try {
      parsed = parseUseCaseMarkdown(readFileSync(file, "utf8"));
    } catch (error) {
      findings.push({
        rule: "frontmatter-schema",
        level: "error",
        message: formatParseError(error),
        location,
      });
      continue;
    }
    findings.push(...validateUseCase({ root, file, useCase: parsed, stakeholderRefs }));
  }

  return { findings, files: files.map((file) => relativePath(file, root)) };
}

function resolveTargets(root: string, target?: string): string[] {
  if (!target) return walkFiles(join(root, "specs/usecases"), (path) => path.endsWith(".md"));
  const direct = resolve(root, target);
  if (existsSync(direct)) {
    return statSync(direct).isDirectory()
      ? walkFiles(direct, (path) => path.endsWith(".md"))
      : direct.endsWith(".md")
        ? [direct]
        : [];
  }
  const byKey = findUseCaseFile(root, target);
  return byKey ? [byKey] : [];
}

function validateUseCase(args: {
  root: string;
  file: string;
  useCase: ParsedUseCase;
  stakeholderRefs: Set<string>;
}): Finding[] {
  const { root, file, useCase, stakeholderRefs } = args;
  const location = relativePath(file, root);
  const findings: Finding[] = [];
  const actorExists = (name: string) => existsSync(join(root, "specs/actors", `${displayToSlug(name)}.md`));
  const requiredLevel = useCase.frontmatter.format === "FULLY_DRESSED" ? "error" : "warn";

  if (useCase.stakeholderInterests.length === 0) {
    findings.push(error("stakeholder-interest-present", "At least one stakeholder interest is required.", location));
  }
  if (useCase.mainSuccess.length === 0) {
    findings.push(error("main-success-has-step", "Main success scenario must have at least one step.", location));
  }
  for (const step of useCase.mainSuccess) {
    validateStep(findings, actorExists, "step-bold-actor-action", location, String(step.number), step.actor, step.action);
  }
  for (const extension of useCase.extensions) {
    for (const step of extension.steps) {
      validateStep(findings, actorExists, "step-bold-actor-action", location, step.id, step.actor, step.action);
    }
  }
  for (const item of useCase.stakeholderInterests) {
    if (!stakeholderRefs.has(item.stakeholder) && !stakeholderRefs.has(displayToSlug(item.stakeholder))) {
      findings.push(error("stakeholder-reference-exists", `Stakeholder ${item.stakeholder} does not exist.`, location));
    }
  }
  if (!actorExists(useCase.frontmatter.primary_actor)) {
    findings.push(error("primary-actor-exists", `Primary actor ${useCase.frontmatter.primary_actor} does not exist.`, location));
  }
  const mainStepNumbers = new Set(useCase.mainSuccess.map((step, index) => step.number || index + 1));
  for (const extension of useCase.extensions) {
    const point = extension.point.startsWith("*") ? "*" : Number(extension.point.match(/^(\d+)/)?.[1]);
    if (point !== "*" && !mainStepNumbers.has(point)) {
      findings.push(error("extension-references-step", `Extension ${extension.point} references missing step ${point}.`, location));
    }
    if (extension.rejoinStep !== null && !mainStepNumbers.has(extension.rejoinStep)) {
      findings.push(error("extension-rejoin-step", `Extension ${extension.point} rejoins missing step ${extension.rejoinStep}.`, location));
    }
  }
  if (!useCase.successGuarantee) {
    findings.push(error("success-guarantee-present", "Success Guarantee is required.", location));
  }
  if (!useCase.minimalGuarantee) {
    findings.push(error("minimal-guarantee-present", "Minimal Guarantee is required.", location));
  }
  if (!["SUMMARY", "USER_GOAL", "SUBFUNCTION"].includes(useCase.frontmatter.level)) {
    findings.push(error("level-enum", "level must be SUMMARY, USER_GOAL, or SUBFUNCTION.", location));
  }
  if (!looksLikeVerbPhrase(useCase.frontmatter.title)) {
    findings.push(warn("title-verb-phrase", "Title should be a verb phrase.", location));
  }
  for (const step of useCase.mainSuccess) {
    if (`${step.actor} ${step.action}`.trim().split(/\s+/).length > 25) {
      findings.push(warn("step-word-limit", `Step ${step.number} is over 25 words.`, location));
    }
  }
  if (useCase.mainSuccess.length > 9) {
    findings.push(warn("main-success-step-count", "Main success scenario has more than 9 steps.", location));
  }

  addRequiredFieldFinding(findings, "Stakeholders and Interests", useCase.stakeholderInterests.length > 0, requiredLevel, location);
  addRequiredFieldFinding(findings, "Preconditions", true, requiredLevel, location);
  addRequiredFieldFinding(findings, "Trigger", Boolean(useCase.trigger), requiredLevel, location);
  addRequiredFieldFinding(findings, "Main Success Scenario", useCase.mainSuccess.length > 0, requiredLevel, location);
  addRequiredFieldFinding(findings, "Success Guarantee", Boolean(useCase.successGuarantee), requiredLevel, location);
  addRequiredFieldFinding(findings, "Minimal Guarantee", Boolean(useCase.minimalGuarantee), requiredLevel, location);

  return findings;
}

function validateStep(
  findings: Finding[],
  actorExists: (name: string) => boolean,
  rule: string,
  location: string,
  ref: string,
  actor: string,
  action: string,
) {
  if (!actor || !action) {
    findings.push(error(rule, `Step ${ref} must start with a bold actor and include an action.`, location));
    return;
  }
  if (!actorExists(actor)) {
    findings.push(error("step-actor-exists", `Actor ${actor} in step ${ref} does not exist.`, location));
  }
}

function addRequiredFieldFinding(
  findings: Finding[],
  field: string,
  present: boolean,
  level: "error" | "warn",
  location: string,
) {
  if (!present) findings.push({ rule: "required-field", level, message: `${field} is required.`, location });
}

function readStakeholderRefs(root: string): Set<string> {
  const refs = new Set<string>();
  for (const file of walkFiles(join(root, "specs/stakeholders"), (path) => path.endsWith(".md"))) {
    refs.add(basename(file, ".md"));
    try {
      const fm = parseStakeholderFrontmatter(parseMatter(readFileSync(file, "utf8")).data);
      refs.add(fm.name);
      refs.add(fm.display_name);
      refs.add(displayToSlug(fm.display_name));
    } catch {
      refs.add(basename(file, ".md"));
    }
  }
  return refs;
}

function looksLikeVerbPhrase(title: string): boolean {
  const first = title.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const weakNouns = new Set(["the", "a", "an", "spec", "use", "case", "system"]);
  return first.length > 2 && !weakNouns.has(first) && !first.endsWith("tion");
}

function error(rule: string, message: string, location: string): Finding {
  return { rule, level: "error", message, location };
}

function warn(rule: string, message: string, location: string): Finding {
  return { rule, level: "warn", message, location };
}

function formatParseError(error: unknown): string {
  if (error instanceof ZodError) return `Invalid frontmatter: ${error.issues.map((issue) => issue.path.join(".")).join(", ")}`;
  return error instanceof Error ? error.message : "Invalid use case file.";
}

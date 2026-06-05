import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { findUseCaseFile, readConfig, relativePath } from "../files.js";
import { parseUseCaseMarkdown } from "../format/parse.js";
import type { ParsedUseCase } from "../domain/types.js";

export function renderGherkin(useCase: ParsedUseCase): string {
  const lines: string[] = [
    `Feature: ${useCase.frontmatter.title}`,
    "",
    "  Background:",
    `    Given the use case is in scope ${useCase.frontmatter.scope}`,
    "",
    "  Scenario: Main success",
  ];

  for (const step of useCase.mainSuccess) {
    lines.push(`    When ${step.actor} ${trimSentence(step.action)}`);
  }

  for (const extension of useCase.extensions) {
    lines.push("");
    lines.push(`  Scenario: ${extension.point} ${extension.condition}`);
    if (extension.point.startsWith("*"))
      lines.push("    Given main success reaches any step");
    else
      lines.push(
        `    Given main success reaches step ${extension.point.match(/^(\d+)/)?.[1] ?? extension.point}`,
      );
    for (const step of extension.steps) {
      lines.push(`    When ${step.actor} ${trimSentence(step.action)}`);
    }
    lines.push(`    Then outcome is ${extension.outcome}`);
  }

  return `${lines.join("\n")}\n`;
}

export function exportGherkin(args: {
  key: string;
  output?: string;
  cwd?: string;
}) {
  const config = readConfig(args.cwd ?? process.cwd());
  if (!config) throw new Error("NOT_INITIALIZED");
  const source = findUseCaseFile(config.root, args.key);
  if (!source) throw new Error("KEY_NOT_FOUND");
  const text = renderGherkin(
    parseUseCaseMarkdown(readFileSync(source, "utf8")),
  );
  const output = args.output ?? join("tests", `${args.key}.feature`);
  const outputPath = resolve(config.root, output);
  const resolvedRootPath = resolve(config.root);
  if (!isPathInside(outputPath, resolvedRootPath)) {
    throw new Error("INVALID_PATH");
  }

  const rootPath = realpathSync(config.root);
  const outputDir = dirname(outputPath);
  const existingAncestor = nearestExistingAncestor(outputDir);
  if (!isPathInside(realpathSync(existingAncestor), rootPath)) {
    throw new Error("INVALID_PATH");
  }

  mkdirSync(outputDir, { recursive: true });
  const realTargetPath = existsSync(outputPath)
    ? realpathSync(outputPath)
    : realpathSync(outputDir);
  if (!isPathInside(realTargetPath, rootPath)) {
    throw new Error("INVALID_PATH");
  }

  writeFileSync(outputPath, text);
  return { key: args.key, text, path: relativePath(outputPath, config.root) };
}

function isPathInside(path: string, root: string): boolean {
  return path === root || path.startsWith(root + sep);
}

function nearestExistingAncestor(path: string): string {
  let current = path;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return current;
    current = parent;
  }
  return current;
}

function trimSentence(value: string): string {
  return value.trim().replace(/[.!?]$/g, "");
}

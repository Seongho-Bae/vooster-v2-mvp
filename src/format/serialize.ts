import type { ParsedUseCase, UseCaseExtension } from "../domain/types.js";
import { orderUseCaseFrontmatter, stringifyFrontmatter } from "./frontmatter.js";

export function serializeUseCase(useCase: ParsedUseCase): string {
  const body = renderBody(useCase);
  const text = stringifyFrontmatter(orderUseCaseFrontmatter(useCase.frontmatter), body);
  return ensureSingleTrailingNewline(trimTrailingWhitespace(text));
}

export function renderBody(useCase: ParsedUseCase): string {
  const parts: string[] = [`# ${useCase.title.trim() || useCase.frontmatter.title}`];
  if (useCase.blurb) parts.push(`> ${useCase.blurb.trim()}`);

  parts.push(renderStakeholders(useCase));
  parts.push(renderBullets("Preconditions", useCase.preconditions));
  parts.push(renderParagraph("Trigger", useCase.trigger));
  parts.push(renderMainSuccess(useCase));
  parts.push(renderExtensions(useCase.extensions));
  parts.push(renderParagraph("Success Guarantee", useCase.successGuarantee));
  parts.push(renderParagraph("Minimal Guarantee", useCase.minimalGuarantee));
  if (useCase.notes !== null) parts.push(renderParagraph("Notes", useCase.notes, true));

  return `${parts.filter((part) => part.length > 0).join("\n\n")}\n`;
}

function renderStakeholders(useCase: ParsedUseCase): string {
  const lines = ["## Stakeholders and Interests"];
  for (const item of useCase.stakeholderInterests) {
    const protection = item.protectionMechanism ? ` _(Protected by: ${item.protectionMechanism})_` : "";
    lines.push(`- **${item.stakeholder}**: ${item.interest}${protection}`);
  }
  return lines.join("\n");
}

function renderBullets(title: string, items: string[]): string {
  return [`## ${title}`, ...items.map((item) => `- ${item}`)].join("\n");
}

function renderParagraph(title: string, value: string | null, preserve = false): string {
  const text = value ?? "";
  return preserve ? `## ${title}\n\n${text}`.replace(/\n+$/g, "") : [`## ${title}`, text.trim()].join("\n").replace(/\n+$/g, "");
}

function renderMainSuccess(useCase: ParsedUseCase): string {
  const lines = ["## Main Success Scenario"];
  useCase.mainSuccess.forEach((step, index) => {
    lines.push(`${index + 1}. **${step.actor}** ${step.action}`);
  });
  return lines.join("\n");
}

function renderExtensions(extensions: UseCaseExtension[]): string {
  const lines = ["## Extensions"];
  for (const extension of extensions) {
    if (lines.length > 1) lines.push("");
    lines.push(`### ${extension.point}. ${extension.condition}`);
    extension.steps.forEach((step, index) => {
      const id = `${extension.point}${index + 1}`;
      lines.push(`- ${id}. **${step.actor}** ${step.action}`);
    });
    if (extension.rejoinStep !== null) {
      lines.push(`- (Outcome: ${extension.outcome} — rejoins main at step ${extension.rejoinStep}.)`);
    } else {
      lines.push(`- (Outcome: ${extension.outcome} — use case ends.)`);
    }
  }
  return lines.join("\n");
}

function trimTrailingWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "");
}

function ensureSingleTrailingNewline(text: string): string {
  return `${text}\n`;
}

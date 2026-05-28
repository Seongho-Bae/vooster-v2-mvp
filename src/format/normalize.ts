import { parseUseCaseMarkdown } from "./parse.js";
import { serializeUseCase } from "./serialize.js";

export function normalizeUseCaseMarkdown(text: string): string {
  return serializeUseCase(parseUseCaseMarkdown(text));
}

import matter from "gray-matter";
import { z } from "zod";
import type {
  ActorFrontmatter,
  GoalFrontmatter,
  StakeholderFrontmatter,
  UseCaseFrontmatter,
} from "../domain/types.js";

export const levelSchema = z.enum(["SUMMARY", "USER_GOAL", "SUBFUNCTION"]);
export const formatSchema = z.enum(["BRIEF", "CASUAL", "FULLY_DRESSED"]);
export const statusSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "DEPRECATED",
]);
export const prioritySchema = z.enum(["P0", "P1", "P2", "P3"]);

export const useCaseFrontmatterSchema = z.object({
  vspec_format: z.literal(1),
  type: z.literal("usecase"),
  key: z.string().min(1),
  title: z.string().min(1),
  level: levelSchema,
  format: formatSchema,
  status: statusSchema,
  priority: prioritySchema,
  scope: z.string().min(1),
  primary_actor: z.string().min(1),
  frequency: z.string().min(1).optional(),
});

export const actorFrontmatterSchema = z.object({
  vspec_format: z.literal(1),
  type: z.literal("actor"),
  name: z.string().min(1),
  display_name: z.string().min(1),
  actor_type: z.enum(["PRIMARY", "SUPPORTING", "OFFSTAGE"]),
  is_human: z.boolean(),
  aliases: z.array(z.string()).optional(),
});

export const stakeholderFrontmatterSchema = z.object({
  vspec_format: z.literal(1),
  type: z.literal("stakeholder"),
  name: z.string().min(1),
  display_name: z.string().min(1),
  stakeholder_type: z.enum(["INTERNAL", "EXTERNAL", "REGULATORY"]),
});

export const goalFrontmatterSchema = z.object({
  vspec_format: z.literal(1),
  type: z.literal("goal"),
  id: z.string().min(1),
  actor: z.string().min(1),
  level: levelSchema,
  status: z.enum(["IDENTIFIED", "IN_DESIGN", "PROMOTED", "REJECTED"]),
  priority: prioritySchema,
  linked_usecase: z.string().min(1).optional(),
});

export function parseMatter(text: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const parsed = matter(text);
  return { data: parsed.data, content: parsed.content };
}

export function parseUseCaseFrontmatter(data: unknown): UseCaseFrontmatter {
  return useCaseFrontmatterSchema.parse(data);
}

export function parseActorFrontmatter(data: unknown): ActorFrontmatter {
  return actorFrontmatterSchema.parse(data);
}

export function parseStakeholderFrontmatter(
  data: unknown,
): StakeholderFrontmatter {
  return stakeholderFrontmatterSchema.parse(data);
}

export function parseGoalFrontmatter(data: unknown): GoalFrontmatter {
  return goalFrontmatterSchema.parse(data);
}

export function orderUseCaseFrontmatter(
  fm: UseCaseFrontmatter,
): UseCaseFrontmatter {
  return {
    vspec_format: 1,
    type: "usecase",
    key: fm.key,
    title: fm.title,
    level: fm.level,
    format: fm.format,
    status: fm.status,
    priority: fm.priority,
    scope: fm.scope,
    primary_actor: fm.primary_actor,
    ...(fm.frequency ? { frequency: fm.frequency } : {}),
  };
}

export function orderActorFrontmatter(fm: ActorFrontmatter): ActorFrontmatter {
  return {
    vspec_format: 1,
    type: "actor",
    name: fm.name,
    display_name: fm.display_name,
    actor_type: fm.actor_type,
    is_human: fm.is_human,
    ...(fm.aliases && fm.aliases.length > 0 ? { aliases: fm.aliases } : {}),
  };
}

export function orderStakeholderFrontmatter(
  fm: StakeholderFrontmatter,
): StakeholderFrontmatter {
  return {
    vspec_format: 1,
    type: "stakeholder",
    name: fm.name,
    display_name: fm.display_name,
    stakeholder_type: fm.stakeholder_type,
  };
}

export function orderGoalFrontmatter(fm: GoalFrontmatter): GoalFrontmatter {
  return {
    vspec_format: 1,
    type: "goal",
    id: fm.id,
    actor: fm.actor,
    level: fm.level,
    status: fm.status,
    priority: fm.priority,
    ...(fm.linked_usecase ? { linked_usecase: fm.linked_usecase } : {}),
  };
}

export function stringifyFrontmatter(
  data: Record<string, unknown>,
  body: string,
): string {
  return matter.stringify(body, data);
}

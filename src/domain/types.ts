export type UseCaseLevel = "SUMMARY" | "USER_GOAL" | "SUBFUNCTION";
export type UseCaseFormat = "BRIEF" | "CASUAL" | "FULLY_DRESSED";
export type UseCaseStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "DEPRECATED";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type ActorType = "PRIMARY" | "SUPPORTING" | "OFFSTAGE";
export type StakeholderType = "INTERNAL" | "EXTERNAL" | "REGULATORY";
export type GoalStatus = "IDENTIFIED" | "IN_DESIGN" | "PROMOTED" | "REJECTED";
export type ExtensionOutcome = "SUCCESS" | "FAILURE" | "PARTIAL";

export type UseCaseFrontmatter = {
  vspec_format: 1;
  type: "usecase";
  key: string;
  title: string;
  level: UseCaseLevel;
  format: UseCaseFormat;
  status: UseCaseStatus;
  priority: Priority;
  scope: string;
  primary_actor: string;
  frequency?: string;
};

export type ActorFrontmatter = {
  vspec_format: 1;
  type: "actor";
  name: string;
  display_name: string;
  actor_type: ActorType;
  is_human: boolean;
  aliases?: string[];
};

export type StakeholderFrontmatter = {
  vspec_format: 1;
  type: "stakeholder";
  name: string;
  display_name: string;
  stakeholder_type: StakeholderType;
};

export type GoalFrontmatter = {
  vspec_format: 1;
  type: "goal";
  id: string;
  actor: string;
  level: UseCaseLevel;
  status: GoalStatus;
  priority: Priority;
  linked_usecase?: string;
};

export type StakeholderInterest = {
  stakeholder: string;
  interest: string;
  protectionMechanism: string | null;
};

export type ScenarioStep = {
  number: number;
  actor: string;
  action: string;
};

export type ExtensionStep = {
  id: string;
  actor: string;
  action: string;
};

export type UseCaseExtension = {
  point: string;
  condition: string;
  steps: ExtensionStep[];
  outcome: ExtensionOutcome;
  rejoinStep: number | null;
};

export type ParsedUseCase = {
  frontmatter: UseCaseFrontmatter;
  title: string;
  blurb: string | null;
  stakeholderInterests: StakeholderInterest[];
  preconditions: string[];
  trigger: string | null;
  mainSuccess: ScenarioStep[];
  extensions: UseCaseExtension[];
  successGuarantee: string | null;
  minimalGuarantee: string | null;
  notes: string | null;
};

export type AgentAction = { command: string; reason?: string };
export type AgentEnvelope<TData> = {
  format_version: 1;
  status: "ok" | "error";
  data: TData | null;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  context: { project_key: string | null };
  affected_files: { path: string }[];
  dry_run: boolean;
  suggested_next_actions: AgentAction[];
  warnings: { message: string }[];
};

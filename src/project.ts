import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { orderActorFrontmatter, orderStakeholderFrontmatter, stringifyFrontmatter } from "./format/frontmatter.js";
import { slugify } from "./slug.js";
import { VspecError } from "./errors.js";

export function initProject(args: { root?: string; key?: string }) {
  const root = resolve(args.root ?? process.cwd());
  const prefix = (args.key ?? slugify(basename(root)).replace(/-/g, "_")).toUpperCase();
  const affectedFiles: string[] = [];
  for (const dir of [".vspec", "specs/actors", "specs/stakeholders", "specs/goals", "specs/usecases"]) {
    mkdirSync(join(root, dir), { recursive: true });
  }

  const configPath = join(root, ".vspec/config.json");
  if (!existsSync(configPath)) {
    writeFileSync(configPath, `${JSON.stringify({ vspec_format: 1, key_prefix: prefix, spec_language: "ko" }, null, 2)}\n`);
    affectedFiles.push(".vspec/config.json");
  } else {
    const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    // Re-init must not silently keep a different key. Renaming the prefix would
    // mean renaming every key, file, and reference, which vspec does not do — so
    // a mismatching --key is a self-teaching error, not a no-op.
    if (args.key !== undefined && prefix !== config.key_prefix) {
      throw new VspecError(
        "ALREADY_INITIALIZED",
        `This repo is already initialized with key prefix "${config.key_prefix}". Run vspec init without --key to keep it; vspec does not rename an existing prefix.`,
      );
    }
    if (!config.spec_language) {
      writeFileSync(configPath, `${JSON.stringify({ ...config, spec_language: "ko" }, null, 2)}\n`);
      affectedFiles.push(".vspec/config.json");
    }
  }

  const systemActor = join(root, "specs/actors/system.md");
  if (!existsSync(systemActor)) {
    writeFileSync(
      systemActor,
      stringifyFrontmatter(
        orderActorFrontmatter({
          vspec_format: 1,
          type: "actor",
          name: "system",
          display_name: "System",
          actor_type: "SUPPORTING",
          is_human: false,
        }),
        "명세 대상 시스템입니다.\n",
      ),
    );
    affectedFiles.push("specs/actors/system.md");
  }

  const projectStakeholder = join(root, "specs/stakeholders/project-team.md");
  if (!existsSync(projectStakeholder)) {
    writeFileSync(
      projectStakeholder,
      stringifyFrontmatter(
        orderStakeholderFrontmatter({
          vspec_format: 1,
          type: "stakeholder",
          name: "project-team",
          display_name: "Project Team",
          stakeholder_type: "INTERNAL",
        }),
        "저장소의 명세와 구현 품질을 책임지는 팀입니다.\n",
      ),
    );
    affectedFiles.push("specs/stakeholders/project-team.md");
  }

  const glossary = join(root, "specs/glossary.md");
  if (!existsSync(glossary)) {
    writeFileSync(glossary, defaultGlossary());
    affectedFiles.push("specs/glossary.md");
  }

  return {
    root,
    key_prefix: JSON.parse(readFileSync(configPath, "utf8")).key_prefix as string,
    affectedFiles,
  };
}

function defaultGlossary(): string {
  return `# 유비쿼터스 랭귀지

이 파일은 vspec이 use case 품질을 검토할 때 참고하는 도메인 용어집입니다.

## Preferred Terms

- \`use case\`: actor와 system의 상호작용을 goal 중심으로 기록한 계약.
- \`actor\`: scenario step에서 행동하는 주체.
- \`stakeholder\`: use case 결과에 이해관계를 가진 주체.
- \`main success scenario\`: 목표가 정상적으로 달성되는 대표 경로.
- \`extension\`: main success scenario에서 벗어나는 대안 또는 예외 경로.
- \`success guarantee\`: 성공 시 반드시 참이어야 하는 관찰 가능한 결과.
- \`minimal guarantee\`: 실패하더라도 보장되어야 하는 관찰 가능한 결과.

## Avoid Terms

- \`처리한다\`: 어떤 입력을 어떤 결과로 바꾸는지 구체적으로 작성한다.
- \`관리한다\`: 생성, 조회, 수정, 삭제, 승인, 반려 등 관찰 가능한 동작으로 나눈다.
- \`지원한다\`: 사용자가 무엇을 할 수 있게 되는지 구체적으로 작성한다.
- \`적절히\`: 판단 기준이나 완료 조건을 명시한다.
- \`등\`: 포함 범위를 닫힌 목록으로 작성한다.
- \`관련\`: 대상 도메인 객체나 규칙 이름을 직접 쓴다.
`;
}

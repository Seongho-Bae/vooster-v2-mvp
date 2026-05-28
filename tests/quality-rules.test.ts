import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { initProject } from "../src/project.js";
import { createActor, createStakeholder } from "../src/entity-commands.js";
import { runDoctor } from "../src/validate/doctor.js";

describe("doctor quality rules", () => {
  it("creates a glossary during init", () => {
    const root = join(tmpdir(), `vspec-glossary-${crypto.randomUUID()}`);
    mkdirSync(root, { recursive: true });
    initProject({ root, key: "VSPEC" });
    const glossary = readFileSync(join(root, "specs/glossary.md"), "utf8");
    expect(glossary).toContain("## Preferred Terms");
    expect(glossary).toContain("## Avoid Terms");
    expect(readFileSync(join(root, ".vspec/config.json"), "utf8")).toContain('"spec_language": "ko"');
    rmSync(root, { recursive: true, force: true });
  });

  it("warns when a fully dressed use case is too vague for E2E translation", () => {
    const root = join(tmpdir(), `vspec-quality-${crypto.randomUUID()}`);
    mkdirSync(root, { recursive: true });
    initProject({ root, key: "VSPEC" });
    createActor({ cwd: root, name: "developer", displayName: "개발자" });
    createStakeholder({ cwd: root, name: "team", displayName: "팀" });
    writeFileSync(
      join(root, "specs/usecases/VSPEC-001-vague.md"),
      `---
vspec_format: 1
type: usecase
key: VSPEC-001
title: 모호한 명세를 작성한다
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P1
scope: vspec
primary_actor: developer
---
# 모호한 명세를 작성한다

## Stakeholders and Interests

- **팀**: 기능이 적절히 처리된다.

## Preconditions

- 요청이 존재한다.

## Trigger

개발자가 기능 명세를 요청한다.

## Main Success Scenario

1. **developer** 처리한다.
2. **developer** 클릭한다.
3. **developer** done.

## Extensions

## Success Guarantee

기능이 적절히 처리된다.

## Minimal Guarantee

오류가 관리된다.
`,
    );

    const rules = runDoctor({ root }).findings.map((finding) => finding.rule);
    expect(rules).toContain("quality-specific-step");
    expect(rules).toContain("observable-outcome");
    expect(rules).toContain("testable-guarantee");
    expect(rules).toContain("ubiquitous-language");
    expect(rules).toContain("no-ui-microdetail-unless-domain");
    expect(rules).toContain("acceptance-ready");
    rmSync(root, { recursive: true, force: true });
  });
});

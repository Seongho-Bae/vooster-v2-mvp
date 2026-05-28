---
vspec_format: 1
type: usecase
key: VSPEC-006
title: Follow ai guide
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P2
scope: vspec
primary_actor: ai-agent
---
# Follow ai guide

> Fresh-agent dogfooding: this use case was authored by following only the command walkthrough printed by vspec ai-guide.

## Stakeholders and Interests

- **Future Agent**: onboarding succeeds from the guide alone. _(Protected by: Success Guarantee)_
- **Vooster**: the MVP proves a self-teaching local workflow. _(Protected by: step 5)_

## Preconditions

- The vspec binary is runnable.
- The agent reads only the ai-guide output for the workflow.

## Trigger

A fresh agent needs to author a new use case end to end.

## Main Success Scenario

1. **ai-agent** reads the ai-guide output.
2. **ai-agent** creates or confirms referenced actors and stakeholders.
3. **ai-agent** authors a use case markdown file.
4. **system** validates the use case with doctor.
5. **system** exports a Gherkin feature file.

## Extensions

### 2a. Referenced entity already exists

- 2a1. **system** reports that the entity already exists.
- 2a2. **ai-agent** reuses the existing entity.
- (Outcome: SUCCESS — rejoins main at step 3.)

## Success Guarantee

A new use case can be authored, validated, and exported after reading only ai-guide.

## Minimal Guarantee

The transcript records any command that did not change files.

## Notes

Fresh-agent transcript is captured in docs/dogfood-fresh-agent.md.

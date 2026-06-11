---
vspec_format: 1
type: usecase
key: VSPEC-002
title: Validate specs
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P0
scope: vspec
primary_actor: ai-agent
---

# Validate specs

## Stakeholders and Interests

- **Vooster**: invalid contracts are caught before they shape implementation. _(Protected by: step 4)_
- **Future Agent**: findings are actionable without network access. _(Protected by: Success Guarantee)_

## Preconditions

- A specs tree exists.
- Use case files are written in markdown.

## Trigger

The agent needs evidence that the repository specs are valid.

## Main Success Scenario

1. **ai-agent** runs doctor over the specs tree.
2. **system** reads use cases, actors, and stakeholders from disk.
3. **system** checks Cockburn rules and cross references.
4. **system** reports every error and warning.
5. **ai-agent** fixes the files until no errors remain.

## Extensions

### 2a. A referenced file is missing

- 2a1. **system** reports the missing actor or stakeholder.
- 2a2. **ai-agent** creates the missing entity file.
- (Outcome: PARTIAL — rejoins main at step 1.)

## Success Guarantee

Doctor exits zero when there are no validation errors.

## Minimal Guarantee

Doctor never modifies specification files while validating them.

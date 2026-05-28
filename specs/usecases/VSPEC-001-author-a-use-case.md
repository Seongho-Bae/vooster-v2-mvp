---
vspec_format: 1
type: usecase
key: VSPEC-001
title: Author a use case
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P0
scope: vspec
primary_actor: ai-agent
---
# Author a use case

> The AI agent authors a Cockburn use case as a markdown file while the CLI supplies structure, validation, and stable keys.

## Stakeholders and Interests

- **Vooster**: product behavior is captured as a reviewable contract. _(Protected by: Success Guarantee)_
- **Future Agent**: the file is structured enough to parse and continue later. _(Protected by: step 4)_

## Preconditions

- A vspec project exists.
- Referenced actors and stakeholders exist under specs.

## Trigger

The developer asks the agent to specify a new behavior.

## Main Success Scenario

1. **developer** names the behavior to specify.
2. **ai-agent** creates or selects the next use case key.
3. **ai-agent** writes the use case markdown with all canonical sections.
4. **system** normalizes and parses the file successfully.
5. **ai-agent** runs doctor and resolves findings.

## Extensions

### 3a. Required detail is unknown

- 3a1. **ai-agent** writes the unknown as an empty section or explicit note.
- 3a2. **ai-agent** keeps the file parseable.
- (Outcome: PARTIAL — rejoins main at step 5.)

## Success Guarantee

A parseable use case file exists with stakeholders, scenario steps, guarantees, and a stable key.

## Minimal Guarantee

Existing specification files remain unchanged unless the agent explicitly edits them.

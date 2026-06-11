---
vspec_format: 1
type: usecase
key: VSPEC-003
title: Export to Gherkin
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P1
scope: vspec
primary_actor: ai-agent
---

# Export to Gherkin

## Stakeholders and Interests

- **Vooster**: use cases can feed executable behavior discussions. _(Protected by: Success Guarantee)_
- **Future Agent**: exported files are deterministic and easy to diff. _(Protected by: step 3)_

## Preconditions

- A use case exists and parses successfully.
- The target output directory is writable.

## Trigger

The agent needs a feature file for a use case.

## Main Success Scenario

1. **ai-agent** requests a Gherkin export for a use case key.
2. **system** parses the use case file.
3. **system** renders deterministic feature text.
4. **system** writes the feature file to the requested path.

## Extensions

### 2a. The use case key does not exist

- 2a1. **system** returns a key not found error.
- 2a2. **ai-agent** lists use cases and selects a valid key.
- (Outcome: FAILURE — use case ends.)

## Success Guarantee

A feature file exists for the requested use case.

## Minimal Guarantee

The source use case markdown remains unchanged.

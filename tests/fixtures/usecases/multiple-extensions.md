---
status: DRAFT
format: CASUAL
level: USER_GOAL
title: Export a use case
type: usecase
vspec_format: 1
key: VSPEC-003
priority: P1
primary_actor: developer
scope: vspec
---

# Export a use case

## Stakeholders and Interests

- **Developer**: receives an executable artifact. _(Protected by: Success Guarantee)_

## Preconditions

- The use case parses.

## Trigger

Developer requests export.

## Main Success Scenario

1. **developer** runs export.
2. **system** renders a feature file.
3. **system** writes the feature file.

## Extensions

### 2a. Use case has no steps

- 2a1. **system** reports that export cannot continue.
- (Outcome: FAILURE - use case ends.)

### 3a. Output directory is missing

- 3a1. **system** creates the output directory.
- (Outcome: SUCCESS — rejoins main at step 3.)

## Success Guarantee

A feature file is available.

## Minimal Guarantee

No partial output is trusted.

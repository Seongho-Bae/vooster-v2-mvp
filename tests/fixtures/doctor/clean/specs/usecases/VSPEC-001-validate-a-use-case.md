---
vspec_format: 1
type: usecase
key: VSPEC-001
title: Validate a use case
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P1
scope: vspec
primary_actor: developer
---

# Validate a use case

## Stakeholders and Interests

- **Vooster**: validation findings are trustworthy. _(Protected by: Success Guarantee)_

## Preconditions

- A use case file exists.

## Trigger

Developer needs confidence.

## Main Success Scenario

1. **developer** requests validation.
2. **system** validates the use case.

## Extensions

### 2a. Use case is invalid

- 2a1. **system** reports findings.
- (Outcome: FAILURE — use case ends.)

## Success Guarantee

Validation findings are available.

## Minimal Guarantee

The source file is unchanged.

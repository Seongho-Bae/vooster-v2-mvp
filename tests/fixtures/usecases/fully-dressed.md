---
vspec_format: 1
type: usecase
key: VSPEC-002
title: Validate a use case
level: USER_GOAL
format: FULLY_DRESSED
status: IN_REVIEW
priority: P0
scope: vspec
primary_actor: developer
frequency: daily
---

# Validate a use case

## Stakeholders and Interests

- **Vooster**: specs stay trustworthy. \_(Protected by: step 2)
- **Developer**: errors are actionable.

## Preconditions

- A vspec project exists.
- A use case file exists.

## Trigger

Developer runs doctor.

## Main Success Scenario

1. **developer** runs the doctor command.
2. **system** parses the use case.
3. **system** reports findings.

## Extensions

### 2a. File has invalid frontmatter

- 2a1. **system** reports the schema error.
- (Outcome: FAILURE — use case ends.)

## Success Guarantee

All blocking errors are reported.

## Minimal Guarantee

The original file is not modified.

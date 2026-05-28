---
vspec_format: 1
type: usecase
key: VSPEC-004
title: Recover from interruption
level: USER_GOAL
format: CASUAL
status: DRAFT
priority: P2
scope: vspec
primary_actor: developer
---
# Recover from interruption

## Stakeholders and Interests

- **Developer**: progress can resume. _(Protected by: Minimal Guarantee)_

## Preconditions

- A command is running.

## Trigger

The agent is interrupted.

## Main Success Scenario

1. **developer** restarts the command.
2. **system** reads files from disk.

## Extensions

### *a. Worktree changed during interruption

- *a1. **system** reports current status.
- (Outcome: PARTIAL — rejoins main at step 2.)

## Success Guarantee

The agent works from current files.

## Minimal Guarantee

Unrelated changes are preserved.

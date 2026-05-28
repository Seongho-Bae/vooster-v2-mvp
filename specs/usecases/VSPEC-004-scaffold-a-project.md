---
vspec_format: 1
type: usecase
key: VSPEC-004
title: Scaffold a project
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P1
scope: vspec
primary_actor: ai-agent
---
# Scaffold a project

## Stakeholders and Interests

- **Vooster**: a new repository can start using vspec without service setup. _(Protected by: Success Guarantee)_
- **Future Agent**: the directory layout is predictable. _(Protected by: step 3)_

## Preconditions

- The current working directory is a writable repository.

## Trigger

The agent starts dogfooding or a new specification repository.

## Main Success Scenario

1. **ai-agent** runs init with the chosen key prefix.
2. **system** writes the project config if it is missing.
3. **system** creates specs subdirectories for actors, stakeholders, goals, and use cases.
4. **system** preserves existing files when init is repeated.

## Extensions

### 2a. Config already exists

- 2a1. **system** keeps the existing config file unchanged.
- 2a2. **system** still ensures required directories exist.
- (Outcome: SUCCESS — rejoins main at step 4.)

## Success Guarantee

The repository contains .vspec/config.json and the specs directory layout.

## Minimal Guarantee

No existing specification file is overwritten by init.

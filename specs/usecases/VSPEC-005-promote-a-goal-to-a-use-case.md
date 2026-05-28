---
vspec_format: 1
type: usecase
key: VSPEC-005
title: Promote a goal to a use case
level: USER_GOAL
format: FULLY_DRESSED
status: DRAFT
priority: P1
scope: vspec
primary_actor: ai-agent
---
# Promote a goal to a use case

## Stakeholders and Interests

- **Vooster**: candidate goals can become durable behavior contracts. _(Protected by: Success Guarantee)_
- **Future Agent**: the backlog keeps a trace to the promoted use case. _(Protected by: step 4)_

## Preconditions

- A goal file exists with status IDENTIFIED or IN_DESIGN.
- The referenced actor exists.

## Trigger

The agent decides a backlog goal is ready for specification.

## Main Success Scenario

1. **ai-agent** selects a goal id to promote.
2. **system** allocates the next use case key.
3. **system** writes a use case skeleton from the goal.
4. **system** marks the goal as PROMOTED and records the linked use case key.
5. **ai-agent** completes and validates the new use case.

## Extensions

### 1a. Goal id is unknown

- 1a1. **system** reports that the goal was not found.
- 1a2. **ai-agent** lists goals to choose a valid id.
- (Outcome: FAILURE — use case ends.)

## Success Guarantee

The promoted goal links to a new use case file.

## Minimal Guarantee

The goal remains unchanged when promotion cannot complete.

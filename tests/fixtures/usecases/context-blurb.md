---
vspec_format: 1
type: usecase
key: VSPEC-007
title: Explain context before sections
level: USER_GOAL
format: CASUAL
status: DRAFT
priority: P2
scope: vspec
primary_actor: developer
---

# Explain context before sections

> This use case has a context paragraph that the parser must preserve.

## Stakeholders and Interests

- **Developer**: context is not lost.

## Preconditions

## Trigger

Developer writes a blurb.

## Main Success Scenario

1. **developer** adds a blurb.
2. **system** preserves it.

## Extensions

## Success Guarantee

The blurb round-trips.

## Minimal Guarantee

The body remains parseable.

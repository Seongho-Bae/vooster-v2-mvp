# 01 — Cockburn Use Case Method (Operational Summary)

Source: Alistair Cockburn, _Writing Effective Use Cases_ (2000). This is the
**authoritative interpretation** for vspec. Where Cockburn allows several
styles, we pick one and stick to it. Everything here is enforced (or warned) by
`vspec doctor` — see the [enforcement table](#what-doctor-enforces).

## What a Use Case Is

> A use case is a **contract** for the behavior of the system, in terms of how
> the primary actor and the system interact to achieve a **goal**, protecting
> the interests of all **stakeholders**.

Three operative words: **contract** (a promise, not a wish), **goal** (a
definite ending state), **stakeholders** (multiple parties with interests).

## Required Fields (Fully Dressed)

| Field                      | Required    | Notes                                    |
| -------------------------- | ----------- | ---------------------------------------- |
| `key`                      | Yes         | e.g. `VSPEC-009`. Assigned by the tool.  |
| `title`                    | Yes         | **Verb phrase**, active voice.           |
| `level`                    | Yes         | `SUMMARY` / `USER_GOAL` / `SUBFUNCTION`. |
| `scope`                    | Yes         | The system boundary name.                |
| `primary_actor`            | Yes         | One actor (by `name`).                   |
| Stakeholders and Interests | Yes         | ≥1 interest.                             |
| Preconditions              | Yes         | List (may be empty, not absent).         |
| Trigger                    | Yes         | Single sentence.                         |
| Main Success Scenario      | Yes         | Numbered steps (3–9 typical).            |
| Extensions                 | Recommended | Numbered like `3a`, `*a`.                |
| Success Guarantee          | Yes         | What is true on success.                 |
| Minimal Guarantee          | Yes         | What is true even on failure.            |
| `frequency`, `priority`    | Optional    |                                          |

## Levels (Cockburn's altitude metaphor)

- **SUMMARY** — several user goals bundled (rare).
- **USER_GOAL** — one actor's single-sitting goal. **Default**; the bulk live here.
- **SUBFUNCTION** — supports user-goal steps (e.g. "Authenticate user").

## Format Maturity

`format` records how complete the write-up is:

- `BRIEF` — 2–3 sentences summarizing the main scenario.
- `CASUAL` — free paragraphs covering scenario and some extensions.
- `FULLY_DRESSED` — all fields above populated.

A freshly created use case starts at `BRIEF`. `doctor` only enforces the full
field set for `FULLY_DRESSED`; it _warns_ about missing fields at lower
maturities.

## Actor vs. Stakeholder

- An **Actor** _does_ something (appears in steps).
- A **Stakeholder** _cares_ about something (appears in Stakeholders & Interests).

A person can be both, but enters in different roles. Modeling them separately
forces explicit thought about _whose interest is at stake_ on each step.

## Writing Steps

Each step is one short sentence in **active voice, present tense**:
`<Actor> <verb-phrase> <object>`.

Good:

- "Customer submits the order."
- "System validates the payment method."

Bad:

- "The order is submitted." (passive)
- "Customer clicks 'Submit'." (UI detail)
- "Customer might submit." (uncertain)

The actor name at the start of a step is **bold** in markdown (`**Customer**
submits the order.`) so the parser can split actor from action.

## Extensions

Extensions describe **deviations** from the main success scenario.

- `3a` = an alternative at step 3. Multiple alternatives at the same step are
  `3a`, `3b`, `3c`. Substeps are `3a1`, `3a2`.
- `*a` = at any step.
- The extension's first line is the **condition**; subsequent indented lines are
  the **handling** steps.
- An extension terminates by either **rejoining** the main scenario (specify the
  step number) or **ending** the use case with an outcome
  (`SUCCESS | FAILURE | PARTIAL`). Default outcome is `FAILURE`.

## Stakeholders & Interests (the unique value)

For every use case, list **at least one** interest. Format:

> **Stakeholder display name**: what they want to be true at the end. _(Protected by: <step ref or guarantee>)_

The main success scenario must honor every listed interest on success. Each
extension should keep every interest at least minimally protected.

## Goals vs. Use Cases (Backlog vs. Spec)

A **Goal** is a _candidate_ — something an actor wants to do, captured during the
Actor-Goal List phase. Not every goal becomes a use case (some are duplicates,
out of scope, or folded into a larger goal). An approved goal is **promoted** to
a use case; the goal records the link (`linked_usecase`) so the backlog → spec
evolution stays visible.

Goal status: `IDENTIFIED | IN_DESIGN | PROMOTED | REJECTED`.

## What `doctor` Enforces

`vspec doctor` runs **fully offline** against the files in `specs/`. Errors fail
(non-zero exit); warnings pass (zero exit) but are reported.

| Rule                                                             | Level |
| ---------------------------------------------------------------- | ----- |
| At least one stakeholder interest.                               | Error |
| Main success scenario has ≥1 step.                               | Error |
| Each step has a bold actor + an action.                          | Error |
| Each step's actor exists in `specs/actors/`.                     | Error |
| Each stakeholder reference exists in `specs/stakeholders/`.      | Error |
| `primary_actor` exists in `specs/actors/`.                       | Error |
| Extensions reference an existing step number or `*`.             | Error |
| `Success Guarantee` and `Minimal Guarantee` are present.         | Error |
| `level` is one of the three enumerated values.                   | Error |
| Frontmatter passes its zod schema (required fields, enums).      | Error |
| Required field missing while `format: FULLY_DRESSED`.            | Error |
| Title is a verb phrase (heuristic).                              | Warn  |
| Step over 25 words.                                              | Warn  |
| More than 9 main success steps.                                  | Warn  |
| Required field missing while `format: BRIEF` / `CASUAL`.         | Warn  |
| Scenario step uses vague glossary Avoid Terms.                   | Warn  |
| Scenario step is too short to become an E2E assertion.           | Warn  |
| Guarantee is not concrete or observable.                         | Warn  |
| Contract text uses glossary Avoid Terms instead of domain terms. | Warn  |
| Scenario step focuses on UI mechanics instead of domain action.  | Warn  |
| Scenario step lacks enough action/object detail for acceptance.  | Warn  |

The exact list is the contract for the `doctor` phase (see `GOAL.md` P2). Each
row maps to a discrete check with its own test.

## References

- `02-file-format.md` — the markdown serialization these rules run against.
- `03-cli-spec.md` — `vspec doctor`, `vspec usecase`, etc.

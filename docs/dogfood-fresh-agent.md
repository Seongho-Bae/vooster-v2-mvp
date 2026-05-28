# Fresh-Agent Dogfood Notes

Constraint: start from `vspec ai-guide` and do not read the other docs.

Transcript summary:

1. Ran `vspec ai-guide` and followed its command sequence.
2. Confirmed the repository was already initialized with `vspec init --key VSPEC`.
3. Reused existing actors and stakeholders when create commands reported existing files.
4. Authored `specs/usecases/VSPEC-006-follow-ai-guide.md` using the guide's required workflow.
5. Ran `vspec doctor VSPEC-006` and resolved the use case to zero errors.
6. Ran `vspec export gherkin VSPEC-006 --output features/VSPEC-006.feature`.

Result: the fresh-agent task succeeded using the guide as the only workflow reference.

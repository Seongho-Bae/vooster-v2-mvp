## 2025-02-28 - [Path Traversal in Gherkin Export]
**Vulnerability:** Path traversal in `src/export/gherkin.ts` where `exportGherkin` `output` argument was appended directly to `config.root`.
**Learning:** In a CLI that generates and outputs files, user-supplied paths must always be sanitized and validated using `path.resolve` and checked with `path.relative` to ensure they do not write outside the intended scope (`config.root`).
**Prevention:** Construct absolute paths using `path.resolve()` and verify boundaries using `const rel = path.relative(root, target)`. Always check both `rel.startsWith("..")` and `path.isAbsolute(rel)` to ensure security across all platforms, including Windows.

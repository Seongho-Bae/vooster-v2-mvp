## 2026-05-31 - [Path Traversal in Gherkin Export]

**Vulnerability:** Path traversal vulnerability in `exportGherkin` due to unsanitized output path input. The path was simply joined with `config.root`.
**Learning:** `path.resolve` combined with `path.sep` prefix matching is essential to securely validate file outputs stay within intended boundaries when dealing with user-supplied relative paths.
**Prevention:** Always use `path.resolve` to normalize output paths and assert that the resulting path begins with the absolute project root (plus a separator to prevent sibling directory matches).

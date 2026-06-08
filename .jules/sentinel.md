## 2025-06-08 - Path Traversal in Gherkin Export
**Vulnerability:** The `exportGherkin` command allowed path traversal vulnerabilities through the `output` parameter by constructing paths using `join` without ensuring they remain inside the project root, allowing arbitrary file write outside the project structure.
**Learning:** `join` is insufficient for enforcing path boundaries when user input is involved, which could result in overwriting critical files or gaining broader filesystem access.
**Prevention:** Construct absolute paths using `path.resolve()` and verify boundaries using `const rel = path.relative(root, target)`. Always check both `rel.startsWith("..")` and `path.isAbsolute(rel)` to ensure security across all platforms, including Windows.

## 2026-06-13 - Fix path traversal in exportGherkin
**Vulnerability:** The `exportGherkin` function allows writing the exported feature file to any path on the system via the `output` argument, because it does not validate that the resolved path is within the project directory.
**Learning:** `path.join(root, output)` does not prevent path traversal if `output` starts with `../` or is an absolute path.
**Prevention:** Construct absolute paths using `path.resolve()` and verify boundaries using `const rel = path.relative(root, target)`. Always check both `rel.startsWith("..")` and `path.isAbsolute(rel)` to ensure security.

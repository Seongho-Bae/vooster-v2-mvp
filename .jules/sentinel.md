## 2024-06-07 - Path Traversal Vulnerability in file export
**Vulnerability:** The `exportGherkin` command allowed specifying a custom `--output` path without ensuring it resided within the project boundaries, leading to potential path traversal vulnerabilities.
**Learning:** Functions dealing with output paths provided by users must strictly validate boundaries to ensure files are written within authorized directories (`config.root`).
**Prevention:** Construct absolute paths using `path.resolve()` and verify bounds using `const rel = path.relative(root, target)`. Check both `rel.startsWith("..")` and `path.isAbsolute(rel)`.

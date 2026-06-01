## 2026-05-30 - Prevent Path Traversal in File Output and Resolution

**Vulnerability:** A path traversal vulnerability existed in two files: `src/export/gherkin.ts` and `src/validate/doctor.ts`. In `src/export/gherkin.ts`, user input `args.output` could contain arbitrary relative paths like `../../etc/passwd` that `path.join()` would merge with the project directory root, allowing malicious file overrides. In `src/validate/doctor.ts`, `resolveTargets` suffered from a similar issue.

**Learning:** This repo frequently operates dynamically with user-provided directories and paths via the CLI. It's critical to avoid raw `join()` calls with user input and instead explicitly construct absolute paths with `resolve()` and guard bounds via `relative()`. Using `path.isAbsolute(relative_path)` ensures the check applies securely to Windows drive mappings as well.

**Prevention:** Always use `const resolvedPath = path.resolve(base, user_input)` followed by `const rel = path.relative(base, resolvedPath)`. Reject if `rel.startsWith("..") || path.isAbsolute(rel)`.

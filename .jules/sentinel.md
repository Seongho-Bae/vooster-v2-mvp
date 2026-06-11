## 2024-06-03 - [CRITICAL] Path Traversal in exportGherkin
**Vulnerability:** Found a path traversal vulnerability in `exportGherkin` function (`src/export/gherkin.ts`) where unsanitized user input (`--output` flag) was joined with the project root, allowing arbitrary file writes outside the project directory (e.g., `vspec export gherkin VSPEC-001 --output ../../../../tmp/hacked.txt`).
**Learning:** File path concatenation using `path.join` is unsafe when dealing with user input, as it doesn't prevent directory traversal sequences (`../`).
**Prevention:** Always construct absolute paths with `path.resolve` and verify boundaries using `path.relative(root, target)`. Ensure the relative path does not start with `..` and is not an absolute path to confine writes to the intended directory.

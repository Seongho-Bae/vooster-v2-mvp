## 2024-06-04 - [Path Traversal in Gherkin Export]
**Vulnerability:** Path traversal vulnerability in `exportGherkin` due to lack of boundary checks on `--output` path.
**Learning:** Even internal CLI tools can have traversal vulnerabilities when constructing file paths with unsanitized inputs like `join(config.root, output)`.
**Prevention:** Construct absolute paths using `path.resolve()` and verify the resolved path remains within the expected root directory using `path.relative()` and checking for absolute roots or `..` prefixes.

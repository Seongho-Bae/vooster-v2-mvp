## 2024-06-09 - Path Traversal Vulnerability in `exportGherkin`
**Vulnerability:** The `--output` argument in `vspec export gherkin` does not sanitize the `output` file path. It is concatenated with the config root directly (`join(config.root, output)`).
**Learning:** This allows an attacker to provide a path like `../../../../etc/passwd` to write Gherkin export data to unauthorized locations outside the project directory.
**Prevention:** Implement strict input validation on constructed paths to verify they remain within the expected directory bounds. Use `path.resolve` and check if the resolved relative path starts with `..` or is an absolute path.

## 2026-05-31 - [Optimize recursive filesystem walks]
**Learning:** `vspec` relies heavily on filesystem operations during validation (`doctor`), mapping slugs to files frequently. A naive `readdirSync` followed by `statSync` for every file is very slow. Using `fs.readdirSync(root, { withFileTypes: true })` bypasses `statSync` by yielding `Dirent` entries.
**Action:** Always prefer `readdirSync(..., { withFileTypes: true })` over `readdirSync(...) + statSync(...)` when recursing or filtering files in Node.js scripts. This is especially true here because vspec is a local-first cli application.

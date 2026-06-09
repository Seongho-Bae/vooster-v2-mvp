## 2026-06-09 - Optimize File System Traversal
**Learning:** Combining `fs.readdirSync` with `fs.statSync` for every file is a major performance bottleneck for local-first CLI tools that traverse many files.
**Action:** Always prefer `fs.readdirSync(..., { withFileTypes: true })` to avoid redundant syscalls, which significantly speeds up directory traversal.

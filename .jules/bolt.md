## 2025-05-18 - fs.readdirSync vs fs.statSync
**Learning:** For deep file traversal, relying on `fs.readdirSync` with `fs.statSync` inside the loop causes significant performance degradation due to unnecessary blocking system calls for every file.
**Action:** Always prefer `fs.readdirSync(root, { withFileTypes: true })` instead when building file walkers, to fetch directory entry type information (`isDirectory()`, `isFile()`) simultaneously with the directory contents.

## 2025-02-12 - Optimized Filesystem Traversal
**Learning:** For a local-first CLI that extensively walks directories, `fs.readdirSync` coupled with `fs.statSync` introduces significant, unnecessary disk I/O bottlenecks.
**Action:** Always prefer `fs.readdirSync(..., { withFileTypes: true })` over manually calling `fs.statSync` per file/directory to drastically improve file traversal performance.

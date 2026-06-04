## 2024-06-04 - Optimize walkFiles
**Learning:** Using `fs.readdirSync` combined with `fs.statSync` inside recursive file traversal (`walkFiles`) introduces a major I/O bottleneck in this local CLI due to redundant system calls.
**Action:** Always prefer `fs.readdirSync(..., { withFileTypes: true })` to get file types directly from directory entries without additional stat calls.

## 2024-05-14 - Optimize file system traversal
**Learning:** `fs.readdirSync(..., { withFileTypes: true })` is significantly faster than combining `fs.readdirSync` with `fs.statSync` in Node.js because it avoids extra syscalls for statting files that can be returned directly by the directory read. This was a critical bottleneck when recursively reading large sets of spec markdown files in this local-first CLI.
**Action:** Always prefer `withFileTypes: true` when doing recursive directory reads in Node.js, unless we specifically need full stat info.

## 2024-06-06 - [Performance Optimization] Filesystem Traversal
**Learning:** In local-first CLI applications that extensively traverse the filesystem (like vspec), using `fs.readdirSync` with `fs.statSync` for each file causes a significant performance bottleneck due to excessive I/O operations.
**Action:** Always use `fs.readdirSync(..., { withFileTypes: true })` instead. It directly returns `fs.Dirent` objects containing type information, saving an I/O system call per file and dramatically speeding up directory traversals.

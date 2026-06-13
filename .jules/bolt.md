## 2026-06-09 - Optimize File System Traversal
**Learning:** Combining `fs.readdirSync` with `fs.statSync` for every file is a major performance bottleneck for local-first CLI tools that traverse many files.
**Action:** Always prefer `fs.readdirSync(..., { withFileTypes: true })` to avoid redundant syscalls, which significantly speeds up directory traversal.

## 2026-06-09 - Concurrent I/O over Synchronous Mapping
**Learning:** Mapping over an array of files with `fs.readFileSync` creates a massive performance bottleneck by blocking the main thread sequentially, which degrades scalability when a directory has many files.
**Action:** Always prefer `fs.promises.readFile` concurrently with `Promise.all()` over synchronous `readFileSync` loops for optimal I/O performance, ensuring that caller functions and command wrappers are correctly updated to handle `async` execution.

## 2024-06-05 - Avoid statSync in filesystem traversal
**Learning:** In local-first CLI applications that heavily rely on file system traversal, using `readdirSync` followed by `statSync` creates a severe performance bottleneck due to excessive I/O operations.
**Action:** Always use `readdirSync(path, { withFileTypes: true })` to retrieve `fs.Dirent` objects which provide `.isDirectory()` without additional I/O overhead.

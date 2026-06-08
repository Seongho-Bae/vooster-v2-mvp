## 2024-05-18 - fs.readdirSync performance bottleneck
**Learning:** Found a severe performance bottleneck in `walkFiles` which combines `fs.readdirSync` with `fs.statSync`. This forces synchronous I/O blocks for every file/directory just to determine if it's a directory.
**Action:** Replace `fs.readdirSync(..., { withFileTypes: true })` which returns `Dirent` objects, avoiding the need for individual `statSync` calls to check `isDirectory()`. This improves I/O performance significantly when traversing large file trees in this CLI app.

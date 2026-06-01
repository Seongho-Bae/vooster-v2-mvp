import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, readFileSync } from "fs";
import { join, basename } from "path";
import { runDoctor } from "./src/validate/doctor.js";

const root = join(process.cwd(), "benchmark_tmp_final");

if (existsSync(root)) {
  rmSync(root, { recursive: true, force: true });
}
mkdirSync(join(root, "specs", "actors"), { recursive: true });
mkdirSync(join(root, "specs", "stakeholders"), { recursive: true });
mkdirSync(join(root, "specs", "usecases"), { recursive: true });

for (let i = 0; i < 5000; i++) {
  writeFileSync(join(root, "specs", "actors", `actor-${i}.md`), `---\ndisplay_name: Actor ${i}\n---\n`);
  writeFileSync(join(root, "specs", "stakeholders", `stakeholder-${i}.md`), `---\ndisplay_name: Stakeholder ${i}\n---\n`);
}

writeFileSync(join(root, "specs", "usecases", "UC-1.md"), `---\ntitle: Do something\nprimary_actor: actor-1\nlevel: USER_GOAL\nformat: CASUAL\n---\n`);

console.time("runDoctor");
runDoctor({ root, target: "UC-1.md" });
console.timeEnd("runDoctor");

rmSync(root, { recursive: true, force: true });

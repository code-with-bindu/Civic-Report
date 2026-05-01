import { existsSync, unlinkSync } from "fs";

for (const f of ["package-lock.json", "yarn.lock"]) {
  if (existsSync(f)) {
    try { unlinkSync(f); } catch {}
  }
}

const agent = process.env.npm_config_user_agent ?? "";
if (!agent.startsWith("pnpm/")) {
  console.error("Error: Please use pnpm instead of npm or yarn.");
  process.exit(1);
}

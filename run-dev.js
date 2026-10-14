import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("🚀 Starting MLR Student Portal (Full-Stack Mode)...");
console.log("   • Backend: Node.js + Express + SQLite (Port 5000)");
console.log("   • Frontend: Vite + React 19 + TypeScript (Port 5173)");
console.log("==================================================\n");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

// 1. Start Backend Server
const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "pipe",
  shell: true
});

backend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// 2. Start Frontend Server
const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "pipe",
  shell: true
});

frontend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[31m[Frontend Error]\x1b[0m ${data}`);
});

function cleanup() {
  console.log("\nShutting down MLR Student Portal services...");
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

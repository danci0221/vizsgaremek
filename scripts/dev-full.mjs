import { spawn } from "node:child_process";
import process from "node:process";

const children = [];
const npmExecPath = process.env.npm_execpath || "npm";
const npmInvoker = process.execPath;

function start(name, args) {
  const commandArgs = npmExecPath.endsWith(".js") ? [npmExecPath, ...args] : args;
  const command = npmExecPath.endsWith(".js") ? npmInvoker : npmExecPath;

  const child = spawn(command, commandArgs, {
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} leallt (kod: ${code}).`);
      shutdown(code);
    }
  });

  children.push(child);
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("API", ["run", "server"]);
start("Frontend", ["run", "dev"]);

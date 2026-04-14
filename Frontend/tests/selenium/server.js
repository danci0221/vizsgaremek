import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { BASE_URL, FRONTEND_ROOT, HOST, PORT, SERVER_TIMEOUT_MS, START_SERVER } from "./config.js";

async function fetchWithTimeout(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function npmCommand() {
  if (process.platform === "win32") {
    return {
      command: "npm.cmd",
      args: ["run", "dev", "--", "--host", HOST, "--port", String(PORT), "--strictPort"],
    };
  }

  return {
    command: "npm",
    args: ["run", "dev", "--", "--host", HOST, "--port", String(PORT), "--strictPort"],
  };
}

export async function waitForServer(url = BASE_URL, timeoutMs = SERVER_TIMEOUT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok || response.status === 304) {
        return;
      }
    } catch {
      // The dev server is still starting.
    }

    await delay(500);
  }

  throw new Error(`A frontend szerver nem indult el időben: ${url}`);
}

export async function withServer(task) {
  if (!START_SERVER) {
    await waitForServer();
    return task();
  }

  const runner = npmCommand();
  const child = spawn(runner.command, runner.args, {
    cwd: FRONTEND_ROOT,
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  const childExitPromise = new Promise((_, reject) => {
    child.once("exit", (code) => {
      reject(new Error(`A frontend szerver idő előtt leállt (exit code: ${code ?? "ismeretlen"}).`));
    });
    child.once("error", (error) => {
      reject(error);
    });
  });

  try {
    await Promise.race([waitForServer(), childExitPromise]);
    return await task();
  } finally {
    child.kill("SIGTERM");
    await delay(1000);
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
}

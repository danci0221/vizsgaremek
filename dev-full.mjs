import { spawn } from "node:child_process";
import process from "node:process";

const children = [];
const npmExecPath = process.env.npm_execpath || "npm";
const npmInvoker = process.execPath;

function runNpm(args) {
  const commandArgs = npmExecPath.endsWith(".js") ? [npmExecPath, ...args] : args;
  const command = npmExecPath.endsWith(".js") ? npmInvoker : npmExecPath;
  return spawn(command, commandArgs, { stdio: "inherit" });
}

function start(name, args) {
  const child = runNpm(args);

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} leallt (kod: ${code}).`);
      shutdown(code);
    }
  });

  children.push(child);
}

function installAndStart() {
  return new Promise((resolve) => {
    console.log("📦 Függőségek telepítése a root-ban...");
    const installRoot = runNpm(["install"]);

    installRoot.on("exit", (code) => {
      if (code !== 0) {
        console.error("Hiba a root install alatt!");
        process.exit(1);
      }

      console.log("📦 Függőségek telepítése a backend-ben...");
      const installBackend = runNpm(["--prefix", "backend", "install"]);

      installBackend.on("exit", (code) => {
        if (code !== 0) {
          console.error("Hiba a backend install alatt!");
          process.exit(1);
        }

        console.log("📦 Függőségek telepítése a Frontend-ben...");
        const installFrontend = runNpm(["--prefix", "Frontend", "install"]);

        installFrontend.on("exit", (code) => {
          if (code !== 0) {
            console.error("Hiba a Frontend install alatt!");
            process.exit(1);
          }

          console.log("📦 Függőségek telepítése a docusaurus-ban...");
          const installDocs = runNpm(["--prefix", "docusaurus", "install"]);

          installDocs.on("exit", (code) => {
            if (code !== 0) {
              console.error("Hiba a docusaurus install alatt!");
              process.exit(1);
            }

            console.log("✅ Összes függőség telepítve! Szerverek indítása...\n");
            resolve();
          });
        });
      });
    });
  });
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

await installAndStart();

start("API", ["--prefix", "backend", "run", "dev"]);
start("Frontend", ["--prefix", "Frontend", "run", "dev"]);
start("Docs", ["--prefix", "docusaurus", "run", "start"]);

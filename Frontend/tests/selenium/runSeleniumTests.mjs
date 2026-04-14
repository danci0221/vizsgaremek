import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..', '..');
const testDir = resolve(__dirname);
const port = process.env.SELENIUM_PORT || '5173';
const baseUrl = process.env.SELENIUM_BASE_URL || `http://127.0.0.1:${port}`;
const browser = process.env.SELENIUM_BROWSER || 'chrome';
const headless = process.env.SELENIUM_HEADLESS !== 'false';
const startServer = process.env.SELENIUM_START_SERVER !== 'false';
const selectedTests = process.argv.slice(2);

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('exit', (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function waitForUrl(url, timeoutMs = 30000, child) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (child && child.exitCode !== null) {
        reject(new Error(`Frontend dev szerver kilépett korábban (${child.exitCode}), nem sikerült elérni: ${url}`));
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`Nem sikerült elérni a szervert: ${url}`));
        return;
      }
      const req = http.get(url, (res) => {
        res.destroy();
        resolve();
      });
      req.on('error', () => setTimeout(attempt, 500));
    };
    attempt();
  });
}

async function startVite() {
  console.log(`🚀 Frontend szerver indítása: ${baseUrl} (headless=${headless})`);
  const args = ['run', 'dev', '--', '--port', port, '--host', '127.0.0.1'];
  const child = spawn('npm', args, { cwd: frontendRoot, stdio: 'inherit', shell: true });
  child.on('error', (error) => {
    console.error('❌ Hiba a frontend szerver indítása közben:', error.message);
  });
  return child;
}

async function runTestFile(filePath) {
  console.log(`📄 Teszt futtatása: ${filePath}`);
  await runCommand(process.execPath, [filePath], { cwd: frontendRoot, env: { ...process.env, SELENIUM_BASE_URL: baseUrl, SELENIUM_BROWSER: browser, SELENIUM_HEADLESS: String(headless) } });
}

async function runTests() {
  const candidateFiles = await readdir(testDir);
  const testFiles = candidateFiles
    .filter((name) => name.endsWith('.test.js'))
    .filter((name) => selectedTests.length === 0 || selectedTests.includes(name) || selectedTests.includes(`./${name}`));

  if (testFiles.length === 0) {
    console.error('Nem található futtatandó tesztfájl. Használat: node runSeleniumTests.mjs [auth.test.js]');
    process.exit(1);
  }

  for (const testFile of testFiles) {
    await runTestFile(resolve(testDir, testFile));
  }
}

let serverProcess;

async function main() {
  if (startServer) {
    serverProcess = await startVite();
    await waitForUrl(`${baseUrl}/`, 30000, serverProcess);
    console.log('✅ Frontend szerver elérhető.');
  } else {
    console.log('ℹ️ Nem indítok frontend szervert (SELENIUM_START_SERVER=false). Feltételezem, hogy már fut.');
  }

  try {
    await runTests();
    console.log('✅ Selenium tesztek befejezve.');
  } catch (error) {
    console.error('❌ Selenium tesztek közben hiba történt:', error.message);
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => {
  if (serverProcess) serverProcess.kill('SIGTERM');
  process.exit(0);
});

await main();
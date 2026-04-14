import { createDriver } from "./driver.js";
import { withServer } from "./server.js";

async function runTest(driver, suiteName, testCase) {
  try {
    await testCase.run(driver);
    console.log(`PASS [${suiteName}] ${testCase.name}`);
  } catch (error) {
    console.error(`FAIL [${suiteName}] ${testCase.name}`);
    throw error;
  }
}

export async function runSuite(suite) {
  await withServer(async () => {
    const driver = await createDriver();

    try {
      console.log(`--- ${suite.name} ---`);
      for (const testCase of suite.tests) {
        await runTest(driver, suite.name, testCase);
      }
    } finally {
      await driver.quit();
    }
  });
}

export async function runAllSuites(suites) {
  await withServer(async () => {
    const driver = await createDriver();

    try {
      for (const suite of suites) {
        console.log(`--- ${suite.name} ---`);
        for (const testCase of suite.tests) {
          await runTest(driver, suite.name, testCase);
        }
      }
    } finally {
      await driver.quit();
    }
  });
}

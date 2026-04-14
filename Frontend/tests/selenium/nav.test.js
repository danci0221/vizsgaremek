import { BASE_URL } from "./config.js";
import { isDirectExecution, waitForTestId, waitForUrlContains } from "./helpers.js";
import { runSuite } from "./suiteRunner.js";

export const navSuite = {
  name: "NAV",
  tests: [
    {
      name: "header catalog link opens catalog page",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const catalogLink = await waitForTestId(driver, "nav-link-catalog");
        await catalogLink.click();
        await waitForUrlContains(driver, "/kinalat");
        await waitForTestId(driver, "catalog-page");
      },
    },
    {
      name: "header tips link opens tips page",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const tipsLink = await waitForTestId(driver, "nav-link-tips");
        await tipsLink.click();
        await waitForUrlContains(driver, "/tippek");
        await waitForTestId(driver, "tips-page");
      },
    },
    {
      name: "header planner link opens planner page",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const plannerLink = await waitForTestId(driver, "nav-link-planner");
        await plannerLink.click();
        await waitForUrlContains(driver, "/programterv");
        await waitForTestId(driver, "planner-page");
      },
    },
    {
      name: "header map link opens map page",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const mapLink = await waitForTestId(driver, "nav-link-map");
        await mapLink.click();
        await waitForUrlContains(driver, "/terkep");
      },
    },
    {
      name: "logo navigates back to home",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/kinalat`);
        const logo = await waitForTestId(driver, "header-logo");
        await logo.click();
        await waitForUrlContains(driver, "/");
        await waitForTestId(driver, "home-page");
      },
    },
  ],
};

if (isDirectExecution(import.meta.url)) {
  runSuite(navSuite).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

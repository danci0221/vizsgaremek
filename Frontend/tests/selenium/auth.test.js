import { BASE_URL } from "./config.js";
import { isDirectExecution, waitForTestId, waitForUrlContains } from "./helpers.js";
import { runSuite } from "./suiteRunner.js";

export const authSuite = {
  name: "AUTH",
  tests: [
    {
      name: "signup link opens signup form",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const signUpLink = await waitForTestId(driver, "header-signup-link");
        await signUpLink.click();
        await waitForUrlContains(driver, "/auth?mode=signup");
        await waitForTestId(driver, "auth-signup-form");
      },
    },
    {
      name: "signin link opens signin form",
      run: async (driver) => {
        await driver.get(BASE_URL);
        const signInLink = await waitForTestId(driver, "header-signin-link");
        await signInLink.click();
        await waitForUrlContains(driver, "/auth?mode=signin");
        await waitForTestId(driver, "auth-signin-form");
      },
    },
    {
      name: "protected profile route redirects to signin",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/fiok`);
        await waitForUrlContains(driver, "/auth?mode=signin");
        await waitForTestId(driver, "auth-page");
        await waitForTestId(driver, "auth-signin-form");
      },
    },
    {
      name: "protected favorites route redirects to signin",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/kedvencek`);
        await waitForUrlContains(driver, "/auth?mode=signin");
        await waitForTestId(driver, "auth-signin-form");
      },
    },
  ],
};

if (isDirectExecution(import.meta.url)) {
  runSuite(authSuite).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

import { Select } from "selenium-webdriver/lib/select.js";
import { BASE_URL } from "./config.js";
import {
  countByTestId,
  getElementsByTestId,
  isDirectExecution,
  waitForTestId,
} from "./helpers.js";
import { runSuite } from "./suiteRunner.js";

export const mapSuite = {
  name: "MAP",
  tests: [
    {
      name: "map page renders list items",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/terkep`);
        await waitForTestId(driver, "map-page");

        await driver.wait(async () => (await countByTestId(driver, "map-list-item")) > 0, 15000);
      },
    },
    {
      name: "city filter narrows the map list to Budapest",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/terkep`);
        const citySelect = new Select(await waitForTestId(driver, "map-city-select"));
        await citySelect.selectByVisibleText("Budapest");

        await driver.wait(async () => {
          const items = await getElementsByTestId(driver, "map-list-item");
          if (items.length === 0) return false;

          for (const item of items) {
            if ((await item.getAttribute("data-city")) !== "Budapest") {
              return false;
            }
          }

          return true;
        }, 15000);
      },
    },
  ],
};

if (isDirectExecution(import.meta.url)) {
  runSuite(mapSuite).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

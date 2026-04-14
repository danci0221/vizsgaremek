import { By } from "selenium-webdriver";
import { Select } from "selenium-webdriver/lib/select.js";
import { BASE_URL } from "./config.js";
import {
  getSportCardNames,
  isDirectExecution,
  waitForTestId,
  waitForUrlContains,
} from "./helpers.js";
import { runSuite } from "./suiteRunner.js";

export const catalogSuite = {
  name: "CATALOG",
  tests: [
    {
      name: "home hero CTA navigates to catalog",
      run: async (driver) => {
        await driver.get(BASE_URL);
        await waitForTestId(driver, "home-page");
        const ctaButton = await waitForTestId(driver, "home-primary-cta");
        await ctaButton.click();
        await waitForUrlContains(driver, "/kinalat");
        await waitForTestId(driver, "catalog-page");

        const names = await getSportCardNames(driver);
        if (names.length === 0) {
          throw new Error("A kínálat oldalon nem jelent meg sportkártya.");
        }
      },
    },
    {
      name: "catalog search filters to tenisz result",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/kinalat`);
        const searchInput = await waitForTestId(driver, "catalog-search-input");
        await searchInput.sendKeys("Tenisz");

        await driver.wait(async () => {
          const names = await getSportCardNames(driver);
          return names.length === 1 && names[0]?.toLowerCase().includes("tenisz");
        }, 15000);
      },
    },
    {
      name: "free price filter only shows free cards",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/kinalat`);
        const priceSelectElement = await waitForTestId(driver, "filter-price");
        const priceSelect = new Select(priceSelectElement);
        await priceSelect.selectByValue("free");

        await driver.wait(async () => (await getSportCardNames(driver)).length > 0, 15000);

        const priceLabels = await driver.findElements(By.css(".card .price"));
        for (const priceLabel of priceLabels) {
          const text = await priceLabel.getText();
          if (!text.toLowerCase().includes("ingyenes")) {
            throw new Error(`A free szűrő mellett nem ingyenes elem jelent meg: ${text}`);
          }
        }
      },
    },
    {
      name: "clear filters restores multiple results",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/kinalat`);
        const priceSelectElement = await waitForTestId(driver, "filter-price");
        const priceSelect = new Select(priceSelectElement);
        await priceSelect.selectByValue("free");
        await driver.wait(async () => (await getSportCardNames(driver)).length > 0, 15000);

        const clearFilters = await waitForTestId(driver, "clear-filters");
        await clearFilters.click();

        await driver.wait(async () => (await getSportCardNames(driver)).length > 3, 15000);
      },
    },
  ],
};

if (isDirectExecution(import.meta.url)) {
  runSuite(catalogSuite).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

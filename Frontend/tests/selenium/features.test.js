import { Select } from "selenium-webdriver/lib/select.js";
import { BASE_URL } from "./config.js";
import {
  countByTestId,
  isDirectExecution,
  waitForTestId,
} from "./helpers.js";
import { runSuite } from "./suiteRunner.js";

export const featuresSuite = {
  name: "FEATURES",
  tests: [
    {
      name: "planner generates at least one free weekend result in Gyor",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/programterv`);
        await waitForTestId(driver, "planner-page");

        const locationSelect = new Select(await waitForTestId(driver, "planner-location"));
        await locationSelect.selectByVisibleText("Győr");

        const timeSlotSelect = new Select(await waitForTestId(driver, "planner-time-slot"));
        await timeSlotSelect.selectByValue("weekend");

        const budgetSelect = new Select(await waitForTestId(driver, "planner-budget"));
        await budgetSelect.selectByValue("free");

        const submitButton = await waitForTestId(driver, "planner-submit");
        await submitButton.click();

        await waitForTestId(driver, "planner-results");

        const resultCount = await countByTestId(driver, "planner-result-card");
        if (resultCount < 1) {
          throw new Error("A planner nem adott vissza találatot a várt kombinációra.");
        }
      },
    },
    {
      name: "tips next quiz changes the current question",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/tippek`);
        await waitForTestId(driver, "tips-page");

        const question = await waitForTestId(driver, "tips-quiz-question");
        const before = await question.getText();

        const nextButton = await waitForTestId(driver, "tips-next-quiz");
        await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", nextButton);
        await driver.executeScript("arguments[0].click();", nextButton);

        await driver.wait(async () => {
          const currentQuestion = await waitForTestId(driver, "tips-quiz-question");
          return (await currentQuestion.getText()) !== before;
        }, 15000);
      },
    },
    {
      name: "tips random generator keeps a non-empty tip visible",
      run: async (driver) => {
        await driver.get(`${BASE_URL}/tippek`);
        await waitForTestId(driver, "tips-page");

        const randomButton = await waitForTestId(driver, "tips-random-button");
        await randomButton.click();

        const tip = await waitForTestId(driver, "tips-random-tip");
        const text = (await tip.getText()).trim();
        if (!text) {
          throw new Error("A random tipp mező üres maradt.");
        }
      },
    },
  ],
};

if (isDirectExecution(import.meta.url)) {
  runSuite(featuresSuite).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

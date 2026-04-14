import { pathToFileURL } from "node:url";
import { By, until } from "selenium-webdriver";

export async function waitForTestId(driver, value, timeout = 15000) {
  const locator = By.css(`[data-testid="${value}"]`);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

export async function waitForUrlContains(driver, path, timeout = 15000) {
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(path), timeout);
}

export async function getElementsByTestId(driver, value) {
  return driver.findElements(By.css(`[data-testid="${value}"]`));
}

export async function getTextsByTestId(driver, value) {
  const elements = await getElementsByTestId(driver, value);
  return Promise.all(elements.map((element) => element.getText()));
}

export async function getSportCardNames(driver) {
  const cards = await getElementsByTestId(driver, "sport-card");
  return Promise.all(cards.map((card) => card.getAttribute("data-sport-name")));
}

export async function countByTestId(driver, value) {
  const elements = await getElementsByTestId(driver, value);
  return elements.length;
}

export function isDirectExecution(metaUrl) {
  if (!process.argv[1]) return false;
  return pathToFileURL(process.argv[1]).href === metaUrl;
}

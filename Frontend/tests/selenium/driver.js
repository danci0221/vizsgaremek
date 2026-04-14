import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import edge from "selenium-webdriver/edge.js";
import { BROWSER, HEADLESS } from "./config.js";

export async function createDriver() {
  const builder = new Builder().forBrowser(BROWSER);

  if (BROWSER === "edge") {
    const options = new edge.Options();
    if (HEADLESS) {
      options.addArguments("--headless=new", "--disable-gpu");
    }
    options.addArguments("--window-size=1440,1200");
    builder.setEdgeOptions(options);
  } else {
    const options = new chrome.Options();
    if (HEADLESS) {
      options.addArguments("--headless=new", "--disable-gpu");
    }
    options.addArguments("--window-size=1440,1200");
    builder.setChromeOptions(options);
  }

  return builder.build();
}

import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const headless = process.env.SELENIUM_HEADLESS !== 'false';

async function navTesztek() {
    let options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    options.addArguments('--log-level=3', '--silent', '--disable-logging');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.manage().window().maximize();
        console.log("--- NAVIGÁCIÓ TESZTEK (21-25) ---");

        // 21. Navigáció a Kínálat oldalra
        await driver.get(`${BASE_URL}/`);
        let kinalatLink = await driver.wait(until.elementLocated(By.css('[data-testid="nav-link-catalog"]')), 5000);
        await kinalatLink.click();
        await driver.wait(until.urlContains('/kinalat'), 5000);
        console.log("✅ 21. Navigáció Kínálat oldalra: OK");

        // 22. Navigáció a Tippek oldalra
        let tippekLink = await driver.wait(until.elementLocated(By.css('[data-testid="nav-link-tips"]')), 5000);
        await tippekLink.click();
        await driver.wait(until.urlContains('/tippek'), 5000);
        console.log("✅ 22. Navigáció Tippek oldalra: OK");

        // 23. Navigáció a Térkép oldalra
        let terkepLink = await driver.wait(until.elementLocated(By.css('[data-testid="nav-link-map"]')), 5000);
        await terkepLink.click();
        await driver.wait(until.urlContains('/terkep'), 5000);
        console.log("✅ 23. Navigáció Térkép oldalra: OK");

        // 24. Navigáció a Programterv oldalra
        let programtervLink = await driver.wait(until.elementLocated(By.css('[data-testid="nav-link-planner"]')), 5000);
        await programtervLink.click();
        await driver.wait(until.urlContains('/programterv'), 5000);
        console.log("✅ 24. Navigáció Programterv oldalra: OK");

        // 25. Footer: Kínálat link és visszatérés a Főoldalra
        await driver.get(`${BASE_URL}/`);
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(1000);
        let footerKinalat = await driver.wait(until.elementLocated(By.css('.sh-footer a[href="/kinalat"]')), 5000);
        await footerKinalat.click();
        await driver.wait(until.urlContains('/kinalat'), 5000);

        await driver.findElement(By.css('[data-testid="header-logo"]')).click();
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log("✅ 25. Footer link és Főoldal visszatérés (Logo): OK");

    } catch (hiba) { 
        console.error("❌ NAVIGÁCIÓ TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
navTesztek();
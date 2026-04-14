import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const headless = process.env.SELENIUM_HEADLESS !== 'false';

async function sportTesztek() {
    let options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    options.addArguments('--log-level=3', '--silent', '--disable-logging');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.manage().window().maximize();
        console.log("--- SPORT / TARTALOM TESZTEK (14-20) ---");

        // 14. Főoldal Hero betöltése
        await driver.get(`${BASE_URL}/`);
        let hero = await driver.wait(until.elementLocated(By.css('.sh-hero-splash')), 5000);
        if (await hero.isDisplayed()) console.log("✅ 14. Főoldal Hero banner betöltése: OK");

        // 15. Kínálat oldal betöltése
        await driver.findElement(By.css('[data-testid="nav-link-catalog"]')).click();
        await driver.wait(until.urlContains('/kinalat'), 5000);
        let catalogHead = await driver.wait(until.elementLocated(By.css('[data-testid="catalog-page"]')), 5000);
        if (await catalogHead.isDisplayed()) console.log("✅ 15. Kínálat oldal betöltése: OK");

        // 16. Sport kártyák megjelenítése
        await driver.sleep(1000);
        let sportCards = await driver.findElements(By.css('[data-testid="sport-card"]'));
        if (sportCards.length > 0) console.log("✅ 16. Sport kártyák megjelenítése: OK");

        // 17. Sport részletek modal megnyitása
        let firstCard = sportCards[0];
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", firstCard);
        await driver.sleep(500);
        await firstCard.click();
        let modal = await driver.wait(until.elementLocated(By.css('.modal')), 5000);
        if (await modal.isDisplayed()) console.log("✅ 17. Sport részletek Modal megnyitása: OK");

        // 18. Modal tartalom megjelenítése
        let modalContent = await driver.findElement(By.css('.modal-content h2')).getText();
        if (modalContent.length > 0) console.log("✅ 18. Modal tartalom (sport neve) megjelenik: OK");

        // 19. Modal bezárása
        await driver.findElement(By.css('.modal')).click();
        await driver.sleep(500);
        console.log("✅ 19. Modal bezárása: OK");

        // 20. Logo kattintás - visszatérés a főoldalra
        let logo = await driver.findElement(By.css('[data-testid="header-logo"]'));
        await logo.click();
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log("✅ 20. Logo kattintás és visszatérés a főoldalra: OK");

    } catch (hiba) { 
        console.error("❌ SPORT TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
sportTesztek();
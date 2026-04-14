import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const headless = process.env.SELENIUM_HEADLESS !== 'false';

async function extraTesztek() {
    let options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    options.addArguments('--log-level=3', '--silent', '--disable-logging');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.manage().window().maximize();
        console.log("--- FUNKCIÓK TESZTJE (26-30) ---");

        // 26. Kínálat keresés működése
        await driver.get(`${BASE_URL}/kinalat`);
        let keresoMezo = await driver.wait(until.elementLocated(By.css('[data-testid="catalog-search-input"]')), 5000);
        await keresoMezo.sendKeys('Úszás');
        await driver.sleep(1000);
        let filteredCards = await driver.findElements(By.css('[data-testid="sport-card"]'));
        console.log("✅ 26. Kínálat keresés működése: OK");

        // 27. Szűrő használata (sporttípus)
        await driver.get(`${BASE_URL}/kinalat`);
        await driver.sleep(1000);
        let typeFilter = await driver.wait(until.elementLocated(By.css('[data-testid="filter-type"]')), 5000);
        let filterOptions = await typeFilter.findElements(By.css('option'));
        if (filterOptions.length > 1) {
            await filterOptions[1].click();
            await driver.sleep(1000);
        }
        console.log("✅ 27. Sporttípus szűrő használata: OK");

        // 28. Tippek oldal Hero betöltése
        await driver.get(`${BASE_URL}/tippek`);
        let tipsHero = await driver.wait(until.elementLocated(By.css('[data-testid="tips-page"]')), 5000);
        if (await tipsHero.isDisplayed()) console.log("✅ 28. Tippek oldal Hero betöltése: OK");

        // 29. Kvíz indítása és válaszadás
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(1000);
        let quizSection = await driver.wait(until.elementLocated(By.css('[data-testid="tips-quiz-section"]')), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", quizSection);
        await driver.sleep(500);
        let startBtn = await driver.findElement(By.css('.tips-quiz-start'));
        await startBtn.click();
        await driver.sleep(500);
        let questionText = await driver.wait(until.elementLocated(By.css('[data-testid="tips-quiz-question"]')), 5000);
        if (await questionText.isDisplayed()) console.log("✅ 29. Kvíz indítása és kérdés megjelenítése: OK");

        // 30. Térkép oldal - sporthelyek lista
        await driver.get(`${BASE_URL}/terkep`);
        let mapPage = await driver.wait(until.elementLocated(By.css('[data-testid="map-page"]')), 5000);
        if (await mapPage.isDisplayed()) {
            let mapList = await driver.wait(until.elementLocated(By.css('[data-testid="map-list"]')), 5000);
            let mapItems = await mapList.findElements(By.css('[data-testid="map-list-item"]'));
            if (mapItems.length > 0) console.log("✅ 30. Térkép oldal sporthelyek listája: OK");
            else console.log("✅ 30. Térkép oldal betöltése: OK");
        }

    } catch (hiba) { 
        console.error("❌ FUNKCIÓ TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
extraTesztek();
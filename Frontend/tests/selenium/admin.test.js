import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const headless = process.env.SELENIUM_HEADLESS !== 'false';

async function adminTesztek() {
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
        
        console.log("--- ADMIN TESZTEK (6-13) ---");

        // Bejelentkezés admin fiókkal
        await driver.get(`${BASE_URL}/auth?mode=signin`);
        let identifierInput = await driver.wait(until.elementLocated(By.css('[data-testid="auth-signin-form"] input[autocomplete="username"]')), 5000);
        await driver.wait(until.elementIsVisible(identifierInput), 5000);
        await identifierInput.sendKeys('admin@sporthub.hu');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] input[type="password"]')).sendKeys('adminpass');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] button[type="submit"]')).click();

        await driver.wait(until.elementLocated(By.css('.user-menu')), 8000);

        // 6. Admin oldal betöltése
        await driver.get(`${BASE_URL}/admin`);
        let heading = await driver.wait(until.elementLocated(By.css('.admin .section-heading h2')), 5000).getText();
        if (heading.includes('Sporthelyek')) console.log("✅ 6. Admin oldal betöltése: OK");

        // 7. Felhasználók szekció megjelenítése
        let usersSection = await driver.findElement(By.css('.admin-users')).isDisplayed();
        if (usersSection) console.log("✅ 7. Felhasználók szekció megjelenítése: OK");

        // 8. Felhasználók frissítése
        await driver.findElement(By.css('.admin-users .ghost')).click();
        await driver.sleep(2000);
        let userCards = await driver.findElements(By.css('.admin-user-grid article'));
        if (userCards.length > 0) console.log("✅ 8. Felhasználók listázása (Frissítés): OK");

        // 9. Regisztrációk szekció megjelenítése
        let regsSection = await driver.findElement(By.css('.admin-registrations')).isDisplayed();
        if (regsSection) console.log("✅ 9. Regisztrációk szekció megjelenítése: OK");

        // 10. Új sporthely form megjelenítése
        let adminForm = await driver.findElement(By.css('.admin-form')).isDisplayed();
        if (adminForm) console.log("✅ 10. Új sporthely form megjelenítése: OK");

        // 11. Form validáció (üres küldés)
        let submitBtn = await driver.findElement(By.css('.admin-form button[type="submit"].cta'));
        await submitBtn.click();
        await driver.sleep(1000);
        let formStill = await driver.findElement(By.css('.admin-form')).isDisplayed();
        if (formStill) console.log("✅ 11. Form validáció (Üres küldés blokkolva): OK");

        // 12. Sporthelyek lista megjelenítése
        let sportList = await driver.findElement(By.css('.admin-list')).isDisplayed();
        if (sportList) console.log("✅ 12. Sporthelyek lista megjelenítése: OK");

        // 13. Visszatérés a főoldalra
        await driver.findElement(By.css('[data-testid="header-logo"]')).click();
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log("✅ 13. Visszatérés a Főoldalra: OK");

    } catch (hiba) { 
        console.error("❌ ADMIN TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
adminTesztek();
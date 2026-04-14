import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const headless = process.env.SELENIUM_HEADLESS !== 'false';

async function authTesztek() {
    let options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    options.addArguments('--log-level=3', '--silent', '--disable-logging');
    options.excludeSwitches('enable-logging');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.manage().window().maximize();
        
        console.log("--- AUTH TESZTEK (1-5) ---");

        // 1. Sikeres Admin bejelentkezés
        await driver.get(`${BASE_URL}/auth?mode=signin`);
        let identifierInput = await driver.wait(until.elementLocated(By.css('[data-testid="auth-signin-form"] input[autocomplete="username"]')), 5000);
        await driver.wait(until.elementIsVisible(identifierInput), 5000);
        await identifierInput.sendKeys('admin@sporthub.hu');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] input[type="password"]')).sendKeys('adminpass');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] button[type="submit"]')).click();

        await driver.wait(until.elementLocated(By.css('.user-menu')), 8000);
        console.log("✅ 1. Sikeres Admin bejelentkezés: OK");

        // 2. Kijelentkezés
        await driver.findElement(By.css('.user-trigger')).click();
        await driver.sleep(500);
        await driver.wait(until.elementLocated(By.css('.user-item.danger')), 3000).click();
        await driver.wait(until.elementLocated(By.css('[data-testid="header-signin-link"]')), 5000);
        console.log("✅ 2. Kijelentkezés: OK");

        // 3. Sikertelen bejelentkezés (rossz jelszó)
        await driver.get(`${BASE_URL}/auth?mode=signin`);
        await driver.sleep(500);
        identifierInput = await driver.wait(until.elementLocated(By.css('[data-testid="auth-signin-form"] input[autocomplete="username"]')), 5000);
        await identifierInput.sendKeys('admin@sporthub.hu');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] input[type="password"]')).sendKeys('rosszjelszo123');
        await driver.findElement(By.css('[data-testid="auth-signin-form"] button[type="submit"]')).click();
        await driver.sleep(2000);
        let errorMsg = await driver.findElements(By.css('.status.error'));
        if (errorMsg.length > 0) console.log("✅ 3. Sikertelen bejelentkezés (Rossz jelszó blokkolva): OK");

        // 4. Üres form küldése (validáció)
        await driver.get(`${BASE_URL}/auth?mode=signin`);
        await driver.sleep(500);
        await driver.findElement(By.css('[data-testid="auth-signin-form"] button[type="submit"]')).click();
        await driver.sleep(1000);
        let formStillThere = await driver.findElement(By.css('[data-testid="auth-signin-form"]')).isDisplayed();
        if (formStillThere) console.log("✅ 4. Üres form küldése blokkolva (Validáció): OK");

        // 5. Váltás Regisztrációs felületre
        await driver.findElement(By.css('[data-testid="auth-signup-tab"]')).click();
        await driver.sleep(500);
        let signupForm = await driver.findElement(By.css('[data-testid="auth-signup-form"]')).isDisplayed();
        if (signupForm) console.log("✅ 5. Váltás Regisztrációs felületre: OK");

    } catch (hiba) { 
        console.error("❌ AUTH TESZT ELBUKOTT:", hiba.message);
    } finally { 
        await driver.quit(); 
    }
}
authTesztek();
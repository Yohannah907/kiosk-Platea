import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'node:assert/strict';
import { generateReports } from './reportGenerator.mjs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HEADLESS = process.env.HEADLESS === '1';

const results = [];
let submittedOrderNumber = '';

async function runCase(moduleName, id, description, expected, fn) {
  const started = Date.now();
  try {
    const actual = await fn();
    results.push({
      module: moduleName,
      id,
      description,
      expected,
      actual: actual || expected,
      status: 'Pass',
      durationMs: Date.now() - started,
    });
    console.log(`PASS [${moduleName}] ${id} - ${description}`);
  } catch (err) {
    results.push({
      module: moduleName,
      id,
      description,
      expected,
      actual: err instanceof Error ? err.message : String(err),
      status: 'Fail',
      durationMs: Date.now() - started,
    });
    console.error(`FAIL [${moduleName}] ${id} - ${description}:`, err);
  }
}

async function main() {
  const options = new chrome.Options();
  if (HEADLESS) {
    options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
  }
  options.addArguments('--window-size=1280,900');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const suiteStart = Date.now();

  try {
    // MODULE 1: Welcome Page
    await runCase(
      'Welcome Page',
      'TC-001',
      'Verify the Start Your Order button navigates to Login Page.',
      'Navigating from Welcome Page to Login Page.',
      async () => {
        await driver.get(BASE_URL);
        const startBtn = await driver.wait(
          until.elementLocated(By.css('[data-testid="welcome-start-btn"]')),
          8000,
        );
        await startBtn.click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="login-page"]')),
          5000,
        );
        return 'Start Your Order button redirected to the Student Login Page.';
      },
    );

    // MODULE 2: Login Page
    await runCase(
      'Login Page',
      'TC-001',
      'Verify empty Student ID triggers validation message (negative test).',
      'Validation alert appears when Student ID is blank.',
      async () => {
        const submitBtn = await driver.findElement(
          By.css('[data-testid="login-submit-btn"]'),
        );
        await submitBtn.click();
        const alertEl = await driver.wait(
          until.elementLocated(By.css('[data-testid="login-error"]')),
          3000,
        );
        const msg = await alertEl.getText();
        assert.ok(msg.length > 0);
        return `Validation displayed: "${msg}"`;
      },
    );

    await runCase(
      'Login Page',
      'TC-002',
      'Verify entering a hardcoded student ID and clicking Continue to Menu.',
      'Menu Page is displayed with Student ID.',
      async () => {
        const input = await driver.findElement(
          By.css('[data-testid="student-id-input"]'),
        );
        await input.sendKeys('7230515');
        assert.equal(await input.getAttribute('value'), '7230515');

        const submitBtn = await driver.findElement(
          By.css('[data-testid="login-submit-btn"]'),
        );
        await submitBtn.click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="menu-page"]')),
          5000,
        );
        return 'Configured student ID accepted and navigated to Menu Page.';
      },
    );

    // MODULE 3: Menu
    for (const [idx, cat] of ['All Items', 'Meals', 'Snacks', 'Desserts', 'Drinks'].entries()) {
      await runCase(
        'Menu',
        `TC-00${idx + 1}`,
        `Verify the ${cat} category filter displays items.`,
        `${cat} menu cards render cleanly.`,
        async () => {
          const tab = await driver.findElement(
            By.css(`[data-testid="category-tab-${cat}"]`),
          );
          await tab.click();
          const cards = await driver.findElements(
            By.css('[data-testid^="menu-card-"]'),
          );
          assert.ok(cards.length > 0, `Expected items for ${cat}`);
          return `${cat} displayed ${cards.length} product cards.`;
        },
      );
    }

    await runCase(
      'Menu',
      'TC-006',
      'Verify the search field filters products for keyword "Chicken".',
      'Matching products appear for "Chicken".',
      async () => {
        const search = await driver.findElement(
          By.css('[data-testid="menu-search-input"]'),
        );
        await search.sendKeys('Chicken');
        const cards = await driver.findElements(
          By.css('[data-testid^="menu-card-"]'),
        );
        assert.ok(cards.length > 0, 'Expected at least 1 match for Chicken');
        const clearBtn = await driver.findElement(
          By.css('[data-testid="menu-search-clear"]'),
        );
        await clearBtn.click();
        return `Search for "Chicken" returned ${cards.length} matching item(s).`;
      },
    );

    // MODULE 4: Add to Cart Confirmation
    await runCase(
      'Add to Cart Confirmation',
      'TC-001',
      'Verify clicking Add to Cart displays the confirmation modal.',
      'Added to Cart! modal is displayed.',
      async () => {
        await driver
          .findElement(By.css('[data-testid="category-tab-All Items"]'))
          .click();
        const addBtn = await driver.findElement(
          By.css('[data-testid="add-to-cart-shrimp"]'),
        );
        await addBtn.click();
        const modal = await driver.wait(
          until.elementLocated(By.css('[data-testid="added-to-cart-modal"]')),
          3000,
        );
        const title = await modal.getText();
        assert.ok(title.includes('Added to Cart!'));

        const continueBtn = await driver.findElement(
          By.css('[data-testid="continue-shopping-btn"]'),
        );
        await continueBtn.click();
        return 'Added to Cart confirmation modal opened and closed via Continue Shopping.';
      },
    );

    await runCase(
      'Add to Cart Confirmation',
      'TC-002',
      'Verify adding a second item (Shawarma) updates cart badge count.',
      'Cart badge reflects 2 items.',
      async () => {
        await driver
          .findElement(By.css('[data-testid="category-tab-Snacks"]'))
          .click();
        await driver
          .findElement(By.css('[data-testid="add-to-cart-shawarma"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="added-to-cart-modal"]')),
          3000,
        );
        await driver
          .findElement(By.css('[data-testid="continue-shopping-btn"]'))
          .click();

        const badge = await driver
          .findElement(By.css('[data-testid="cart-badge-count"]'))
          .getText();
        assert.equal(badge, '2');
        return 'Cart badge incremented to 2 after adding Shrimp and Shawarma.';
      },
    );

    // MODULE 5: View the Cart
    await runCase(
      'View the Cart',
      'TC-001',
      'Verify selected items and accurate order summary total on View the Cart.',
      'Cart shows Shrimp and Shawarma with total ₱ 145.00.',
      async () => {
        await driver
          .findElement(By.css('[data-testid="view-cart-btn"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="view-cart-page"]')),
          5000,
        );
        const total = await driver
          .findElement(By.css('[data-testid="cart-total"]'))
          .getText();
        assert.equal(total, '₱ 145.00');
        return 'Cart displayed 2 items with accurate computed total ₱ 145.00.';
      },
    );

    // MODULE 6: Loyalty Points
    await runCase(
      'Loyalty Points',
      'TC-001',
      'Verify points, BYO tumbler guidance, and received rewards on the Loyalty Points page.',
      'Loyalty Points page shows the current points and complete earning guidance.',
      async () => {
        await driver
          .findElement(By.css('[data-testid="cart-back-btn"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="menu-page"]')),
          4000,
        );
        await driver
          .findElement(By.css('[data-testid="loyalty-points-btn"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="loyalty-points-page"]')),
          4000,
        );
        const pointsText = await driver
          .findElement(By.css('[data-testid="available-loyalty-points"]'))
          .getText();
        assert.ok(pointsText.includes('pts'));
        const guidelines = await driver
          .findElement(By.css('[data-testid="loyalty-guidelines"]'))
          .getText();
        assert.ok(guidelines.includes('₱40'));
        assert.ok(guidelines.includes('Happy Hour'));
        assert.ok(guidelines.includes('BYO'));
        assert.ok(guidelines.includes('2 bonus points'));
        const pageSource = await driver.getPageSource();
        assert.ok(!pageSource.includes('Balance & Rewards'));
        assert.ok(!pageSource.includes('Available Balance'));

        await driver
          .findElement(By.css('[data-testid="loyalty-points-back-btn"]'))
          .click();
        return 'Loyalty Points page displays points and BYO guidance without the old balance-and-rewards view.';
      },
    );

    // MODULE 7: Order Success
    await runCase(
      'Order Success',
      'TC-001',
      'Verify Confirm Order displays a sequential order number, ₱ 145.00, GCash, and Confirmed.',
      'Order Success page displays accurate confirmation summary.',
      async () => {
        await driver
          .findElement(By.css('[data-testid="view-cart-btn"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="confirm-order-btn"]')),
          4000,
        );
        const pointsOption = await driver.findElement(
          By.css('[data-testid="cart-payment-select"] option[value="Loyalty Points"]'),
        );
        const pointsText = await driver
          .findElement(By.css('[data-testid="cart-loyalty-points"]'))
          .getText();
        const availablePoints = Number.parseInt(pointsText, 10);
        assert.ok((await pointsOption.getText()).includes(`${availablePoints} pts`));
        assert.ok((await pointsOption.getText()).includes('₱'));
        assert.equal(
          await pointsOption.isEnabled(),
          availablePoints >= 1450,
          'Loyalty Points should be selectable only when they cover the full ₱145 order.',
        );
        assert.equal(
          await driver
            .findElements(
              By.css('[data-testid="cart-payment-select"] option[value="Balance"]'),
            )
            .then((options) => options.length),
          0,
        );
        await driver
          .findElement(By.css('[data-testid="cart-payment-select"]'))
          .sendKeys('GCash');
        await driver
          .findElement(By.css('[data-testid="confirm-order-btn"]'))
          .click();

        await driver.wait(
          until.elementLocated(By.css('[data-testid="order-success-page"]')),
          5000,
        );
        const orderNo = await driver
          .findElement(By.css('[data-testid="success-order-number"]'))
          .getText();
        submittedOrderNumber = orderNo;
        const orderTotal = await driver
          .findElement(By.css('[data-testid="success-order-total"]'))
          .getText();
        const orderPay = await driver
          .findElement(By.css('[data-testid="success-payment-method"]'))
          .getText();
        const orderStatus = await driver
          .findElement(By.css('[data-testid="success-order-status"]'))
          .getText();

        assert.match(orderNo, /^#PLT-\d{3,}$/);
        assert.equal(orderTotal, '₱ 145.00');
        assert.equal(orderPay, 'GCash');
        assert.equal(orderStatus, 'Confirmed');

        await driver
          .findElement(By.css('[data-testid="success-back-btn"]'))
          .click();
        await driver.wait(
          until.elementLocated(By.css('[data-testid="menu-page"]')),
          4000,
        );
        return `Order ${orderNo} confirmed (₱ 145.00, GCash) and Back to Menu returned cleanly.`;
      },
    );

    await runCase(
      'Admin Kiosk Order Queue',
      'TC-001',
      'Verify submitted kiosk orders appear in the admin queue and status changes persist.',
      'Admin queue shows the submitted order and retains its updated status after reload.',
      async () => {
        await driver.get(`${BASE_URL}/#admin`);
        const orderRow = await driver.wait(
          until.elementLocated(
            By.css(
              `[data-testid="admin-order-${submittedOrderNumber.replace('#', '')}"]`,
            ),
          ),
          8000,
        );
        assert.ok((await orderRow.getText()).includes(submittedOrderNumber));

        const statusSelect = await driver.findElement(
          By.css(
            `[data-testid="order-status-${submittedOrderNumber.replace('#', '')}"]`,
          ),
        );
        await statusSelect.sendKeys('Ready');
        await driver.wait(async () => (await statusSelect.getAttribute('value')) === 'Ready', 4000);

        await driver.get(`${BASE_URL}/#admin`);
        const persistedStatus = await driver.wait(
          until.elementLocated(
            By.css(
              `[data-testid="order-status-${submittedOrderNumber.replace('#', '')}"]`,
            ),
          ),
          8000,
        );
        await driver.wait(async () => (await persistedStatus.getAttribute('value')) === 'Ready', 4000);
        return `${submittedOrderNumber} appeared in the queue and retained Ready status after reload.`;
      },
    );
  } finally {
    await driver.quit();
    const { htmlPath, jsonPath } = generateReports(results, {
      baseUrl: BASE_URL,
      browser: HEADLESS ? 'Google Chrome (Headless)' : 'Google Chrome',
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - suiteStart,
    });
    console.log(`\nAutomated HTML Report: ${htmlPath}`);
    console.log(`Automated JSON Report: ${jsonPath}`);
    const hasFailures = results.some((r) => r.status === 'Fail');
    if (hasFailures) process.exitCode = 1;
  }
}

main();

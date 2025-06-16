import { test as base } from '@playwright/test';
import { HighLowGamePage } from '../pages/HighLowGamePage';

// Extend the base test with our game page fixture
export const test = base.extend<{ gamePage: HighLowGamePage }>({
  gamePage: async ({ page }, use) => {
    const gamePage = new HighLowGamePage(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export { expect } from '@playwright/test';
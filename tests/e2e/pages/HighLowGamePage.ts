import { type Locator, type Page, expect } from "@playwright/test";
import { GameStateHelper } from "../helpers/gameStateHelper";

/**
 * Page Object Model for the High-Low Card Game
 */
export class HighLowGamePage {
  private gameStateHelper: GameStateHelper;

  // Main page elements
  readonly page: Page;
  readonly gameBoard: Locator;
  readonly startButton: Locator;
  readonly deckCount: Locator;
  readonly deck: Locator;
  readonly ezModeButton: Locator;
  readonly cardCountButton: Locator;
  readonly winMessage: Locator;
  readonly loseMessage: Locator;

  // Stack-related elements
  readonly stacks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameStateHelper = new GameStateHelper(page);

    // Main page elements
    this.gameBoard = page.getByTestId("game-board");
    this.startButton = page.getByRole("button", {
      name: /New Game|Start New Game/,
    });
    this.deckCount = page.getByTestId("deck-count");
    this.deck = page.getByTestId("deck");
    this.ezModeButton = page.getByRole("button", { name: /EZ Mode/ });
    this.cardCountButton = page.getByRole("button", { name: /Card Count/ });
    this.winMessage = page.getByTestId("win-message");
    this.loseMessage = page.getByTestId("lose-message");

    // Stack elements
    this.stacks = page.locator('[data-testid="stack"]');
  }

  /**
   * Navigate to the game page and set up helpers
   */
  async goto() {
    await this.gameStateHelper.setupGameStateHelpers();
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");

    // Wait for device detection to initialize properly
    await this.page.waitForTimeout(500);
  }

  /**
   * Start a new game
   */
  async startNewGame() {
    await this.startButton.click();

    // Wait for game to actually initialize by checking deck count
    await this.page.waitForFunction(
      () => {
        const gameState = (window as any).__gameState;
        return (
          gameState &&
          gameState.value &&
          gameState.value.drawDeck &&
          gameState.value.drawDeck.length === 43
        );
      },
      { timeout: 10000 },
    );

    // Additional wait to ensure UI is fully updated
    await this.page.waitForTimeout(500);
  }

  /**
   * Get a specific stack by row and column (1-indexed)
   */
  getStack(row: number, column: number): Locator {
    return this.page.locator(
      `[data-testid="stack"][data-row="${row}"][data-column="${column}"]`,
    );
  }

  /**
   * Get all playing cards on the page
   */
  getAllCards(): Locator {
    return this.page.locator("playing-card");
  }

  /**
   * Get cards in a specific stack (returns locator for visual cards - only shows top card)
   */
  getStackCards(row: number, column: number): Locator {
    return this.getStack(row, column).locator("playing-card");
  }

  /**
   * Get actual card count in a stack from game state
   */
  async getStackCardCount(row: number, column: number): Promise<number> {
    return await this.page.evaluate(
      ([r, c]) => {
        const gameState = (window as any).__gameState;
        if (!gameState || !gameState.value || !gameState.value.stacks) return 0;
        return gameState.value.stacks[r - 1][c - 1].cards.length;
      },
      [row, column],
    );
  }

  /**
   * Get action buttons for a stack (Higher/Lower/Same)
   */
  getStackActionButtons(row: number, column: number) {
    const stack = this.getStack(row, column);
    return {
      higher: stack.locator('button:has-text("Higher")'),
      lower: stack.locator('button:has-text("Lower")'),
      same: stack.locator('button:has-text("Same")'),
    };
  }

  /**
   * Hover over a stack to reveal controls (desktop)
   */
  async hoverStack(row: number, column: number) {
    await this.getStack(row, column).hover();
  }

  /**
   * Make a move on a stack (works for both desktop and mobile)
   */
  async makeMove(
    row: number,
    column: number,
    action: "higher" | "lower" | "same",
  ) {
    const stack = this.getStack(row, column);

    // First try desktop approach (hover then click)
    await stack.hover();
    const actionButtons = this.getStackActionButtons(row, column);
    const button =
      action === "higher"
        ? actionButtons.higher
        : action === "lower"
          ? actionButtons.lower
          : actionButtons.same;

    try {
      // Try clicking the button if visible
      if (await button.isVisible({ timeout: 1000 })) {
        await button.click();
        await this.page.waitForTimeout(1000); // Wait for animation
        return;
      }
    } catch {
      // Button not visible, might be mobile mode
    }

    // Mobile approach - tap stack then use action panel
    await stack.tap();
    const mobilePanel = this.page.locator(
      '[data-testid="mobile-action-panel"]',
    );

    if (await mobilePanel.isVisible({ timeout: 1000 })) {
      const mobileButtons = this.getMobileActionButtons();
      const button =
        action === "higher"
          ? mobileButtons.higher
          : action === "lower"
            ? mobileButtons.lower
            : mobileButtons.same;
      await button.tap();
      await this.page.waitForTimeout(1000); // Wait for animation
    }
  }

  /**
   * Get mobile action panel
   */
  getMobileActionPanel(): Locator {
    return this.page.locator('[data-testid="mobile-action-panel"]');
  }

  /**
   * Get mobile action buttons
   */
  getMobileActionButtons() {
    return {
      higher: this.page.getByTestId("action-higher").locator("button"),
      lower: this.page.getByTestId("action-lower").locator("button"),
      same: this.page.getByTestId("action-same").locator("button"),
    };
  }

  /**
   * Select a stack on mobile (tap to select)
   */
  async selectStackMobile(row: number, column: number) {
    const stack = this.getStack(row, column);
    await stack.tap();
  }

  /**
   * Close mobile action panel
   */
  async closeMobilePanel() {
    // Tap outside the panel to close it
    await this.gameBoard.tap({ position: { x: 10, y: 10 } });
  }

  /**
   * Check if controls are visible on hover (desktop)
   */
  async areHoverControlsVisible(row: number, column: number): Promise<boolean> {
    const buttons = this.getStackActionButtons(row, column);
    try {
      await expect(buttons.higher).toBeVisible({ timeout: 1000 });
      await expect(buttons.lower).toBeVisible({ timeout: 1000 });
      await expect(buttons.same).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if mobile panel is visible
   */
  async isMobilePanelVisible(): Promise<boolean> {
    const panel = this.getMobileActionPanel();
    try {
      await expect(panel).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Toggle EZ Mode
   */
  async toggleEZMode() {
    await this.ezModeButton.click();
  }

  /**
   * Toggle Card Counting
   */
  async toggleCardCounting() {
    await this.cardCountButton.click();
  }

  // Assertion helpers

  /**
   * Assert initial state (no game started)
   */
  async assertInitialState() {
    await expect(this.page).toHaveTitle(/High-Low/);
    await expect(this.startButton).toBeVisible();
    await expect(this.deckCount).toContainText("Deck: 0 cards");
    await expect(this.stacks).toHaveCount(0);
  }

  /**
   * Assert game started state
   */
  async assertGameStarted() {
    await expect(this.gameBoard).toBeVisible();
    await expect(this.deckCount).toContainText("Deck: 43 cards");
    await expect(this.stacks).toHaveCount(9);

    // Check all stacks are active with one card each
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        const stack = this.getStack(row, col);
        await expect(stack).toBeVisible();
        await expect(stack).toHaveAttribute("data-status", "active");

        // Use game state to check card count (more reliable than DOM)
        const cardCount = await this.getStackCardCount(row, col);
        expect(cardCount).toBe(1);
      }
    }
  }

  /**
   * Assert win state
   */
  async assertWinState() {
    await expect(this.winMessage).toBeVisible();
    await expect(this.winMessage).toContainText("🎉 You Won! 🎉");
  }

  /**
   * Assert lose state
   */
  async assertLoseState() {
    await expect(this.loseMessage).toBeVisible();
    await expect(this.loseMessage).toContainText("💀 Game Over! 💀");
  }

  /**
   * Assert stack is failed
   */
  async assertStackFailed(row: number, column: number) {
    const stack = this.getStack(row, column);
    await expect(stack).toHaveAttribute("data-status", "failed");
  }

  /**
   * Assert deck count
   */
  async assertDeckCount(count: number) {
    await expect(this.deckCount).toContainText(`Deck: ${count} cards`);
  }

  /**
   * Assert EZ Mode state
   */
  async assertEZModeState(enabled: boolean) {
    const expectedText = enabled ? "EZ Mode ON" : "EZ Mode OFF";
    await expect(this.ezModeButton).toContainText(expectedText);
  }

  /**
   * Assert Card Counting state
   */
  async assertCardCountingState(enabled: boolean) {
    const expectedText = enabled ? /Show Stats|Hide Stats/ : "Card Count OFF";
    await expect(this.cardCountButton).toContainText(expectedText);
  }

  /**
   * Assert that hover controls are visible (desktop)
   */
  async assertHoverControlsVisible(row: number, column: number) {
    const buttons = this.getStackActionButtons(row, column);
    await expect(buttons.higher).toBeVisible();
    await expect(buttons.lower).toBeVisible();
    await expect(buttons.same).toBeVisible();
  }

  /**
   * Assert that hover controls are not visible
   */
  async assertHoverControlsNotVisible(row: number, column: number) {
    const buttons = this.getStackActionButtons(row, column);
    await expect(buttons.higher).not.toBeVisible();
    await expect(buttons.lower).not.toBeVisible();
    await expect(buttons.same).not.toBeVisible();
  }

  /**
   * Assert mobile panel is visible
   */
  async assertMobilePanelVisible() {
    const panel = this.getMobileActionPanel();
    await expect(panel).toBeVisible();
  }

  /**
   * Assert mobile panel is not visible
   */
  async assertMobilePanelNotVisible() {
    const panel = this.getMobileActionPanel();
    await expect(panel).not.toBeVisible();
  }

  /**
   * Assert stack is selected (has ring styling)
   */
  async assertStackSelected(row: number, column: number) {
    const stack = this.getStack(row, column);
    const stackInner = stack.locator("div").nth(2);
    await expect(stackInner).toHaveClass(/ring/);
  }

  /**
   * Assert stack is not selected
   */
  async assertStackNotSelected(row: number, column: number) {
    const stack = this.getStack(row, column);
    const stackInner = stack.locator("div").nth(2);
    await expect(stackInner).not.toHaveClass(/ring/);
  }

  /**
   * Assert mobile action buttons are available
   */
  async assertMobileActionButtonsVisible() {
    const buttons = this.getMobileActionButtons();
    await expect(buttons.higher).toBeVisible();
    await expect(buttons.lower).toBeVisible();
    await expect(buttons.same).toBeVisible();
  }

  // Game state manipulation helpers

  /**
   * Force win state through game state manipulation
   */
  async forceWinState() {
    const success = await this.gameStateHelper.setWinState();
    if (success) {
      await this.gameStateHelper.waitForStateUpdate();
    }
    return success;
  }

  /**
   * Force lose state through game state manipulation
   */
  async forceLoseState() {
    const success = await this.gameStateHelper.setLoseState();
    if (success) {
      await this.gameStateHelper.waitForStateUpdate();
    }
    return success;
  }

  /**
   * Force a specific stack to fail
   */
  async forceStackFailed(row: number, column: number) {
    const success = await this.gameStateHelper.setStackFailed(
      row - 1,
      column - 1,
    ); // Convert to 0-indexed

    if (success) {
      // Wait for the UI to reflect the change
      await this.page.waitForTimeout(500);
    }

    return success;
  }

  /**
   * Get current game state
   */
  async getGameState() {
    return await this.gameStateHelper.getGameState();
  }

  /**
   * Get current device detection info for debugging
   */
  async getDeviceInfo() {
    return await this.page.evaluate(() => {
      return {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        hasTouch: "ontouchstart" in window,
      };
    });
  }

  // Animation-aware move methods

  /**
   * Wait for animation to complete
   */
  async waitForAnimationComplete(timeout: number = 5000) {
    // First, wait a small amount to allow animation to start
    await this.page.waitForTimeout(100);

    // Check if animation system exists and wait for it to complete
    try {
      await this.page.waitForFunction(
        () => {
          const uiState = (window as any).__uiState;
          // If no animation system, just return true (no animation to wait for)
          if (!uiState || !uiState.value || !uiState.value.animation)
            return true;

          // Wait for animation to finish
          return uiState.value.animation.isAnimating === false;
        },
        { timeout },
      );
    } catch (e) {
      // If waiting fails, fall back to a reasonable timeout
      console.log("Animation waiting failed, using fallback timeout");
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Wait for game state change (deck count and stack card count)
   */
  async waitForGameStateChange(
    expectedDeckCount: number,
    expectedStackCardCount: number,
    row: number,
    column: number,
    timeout: number = 5000,
  ) {
    await this.page.waitForFunction(
      (args) => {
        const [expectedDeck, expectedStack, r, c] = args;
        const gameState = (window as any).__gameState;
        if (
          !gameState ||
          !gameState.value ||
          !gameState.value.drawDeck ||
          !gameState.value.stacks
        )
          return false;

        try {
          const deckMatches = gameState.value.drawDeck.length === expectedDeck;
          const stackMatches =
            gameState.value.stacks[r - 1] &&
            gameState.value.stacks[r - 1][c - 1] &&
            gameState.value.stacks[r - 1][c - 1].cards.length === expectedStack;

          return deckMatches && stackMatches;
        } catch (e) {
          return false;
        }
      },
      [expectedDeckCount, expectedStackCardCount, row, column],
      { timeout },
    );
  }

  /**
   * Make a higher move and wait for completion
   */
  async makeHigherMoveAndWait(row: number, column: number) {
    // Make the move
    await this.hoverStack(row, column);
    const buttons = this.getStackActionButtons(row, column);
    await buttons.higher.click();

    // Wait for animation to complete
    await this.waitForAnimationComplete();
  }

  /**
   * Make a lower move and wait for completion
   */
  async makeLowerMoveAndWait(row: number, column: number) {
    // Make the move
    await this.hoverStack(row, column);
    const buttons = this.getStackActionButtons(row, column);
    await buttons.lower.click();

    // Wait for animation to complete
    await this.waitForAnimationComplete();
  }

  /**
   * Make a same move and wait for completion
   */
  async makeSameMoveAndWait(row: number, column: number) {
    // Make the move
    await this.hoverStack(row, column);
    const buttons = this.getStackActionButtons(row, column);
    await buttons.same.click();

    // Wait for animation to complete
    await this.waitForAnimationComplete();
  }

  /**
   * Make a move and wait for completion (cross-platform)
   */
  async makeMoveAndWait(
    row: number,
    column: number,
    action: "higher" | "lower" | "same",
  ) {
    const stack = this.getStack(row, column);

    // First try desktop approach (hover then click)
    await stack.hover();
    const actionButtons = this.getStackActionButtons(row, column);
    const button =
      action === "higher"
        ? actionButtons.higher
        : action === "lower"
          ? actionButtons.lower
          : actionButtons.same;

    try {
      // Try clicking the button if visible
      if (await button.isVisible({ timeout: 1000 })) {
        await button.click();
        await this.waitForAnimationComplete();
        return;
      }
    } catch {
      // Button not visible, might be mobile mode
    }

    // Mobile approach - tap stack then use action panel
    await stack.tap();
    const mobilePanel = this.page.locator(
      '[data-testid="mobile-action-panel"]',
    );

    if (await mobilePanel.isVisible({ timeout: 1000 })) {
      const mobileButtons = this.getMobileActionButtons();
      const mobileButton =
        action === "higher"
          ? mobileButtons.higher
          : action === "lower"
            ? mobileButtons.lower
            : mobileButtons.same;
      await mobileButton.tap();
      await this.waitForAnimationComplete();
    }
  }

  /**
   * Get current deck count from game state
   */
  async getDeckCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const gameState = (window as any).__gameState;
      return gameState?.value?.drawDeck?.length || 0;
    });
  }
}

import { expect, test } from "./fixtures/gameFixtures";

test.describe("High-Low Game - Desktop vs Mobile Controls", () => {
  test.describe("Desktop Controls", () => {
    // Force desktop viewport and disable touch
    test.use({
      viewport: { width: 1280, height: 720 },
      hasTouch: false,
      isMobile: false,
    });

    test("should show hover controls on desktop stacks", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const buttons = gamePage.getStackActionButtons(1, 1);

      // Initially, buttons should not be visible
      await expect(buttons.higher).not.toBeVisible();
      await expect(buttons.lower).not.toBeVisible();
      await expect(buttons.same).not.toBeVisible();

      // Hover over the stack
      await gamePage.hoverStack(1, 1);

      // After hover, buttons should become visible
      await expect(buttons.higher).toBeVisible();
      await expect(buttons.lower).toBeVisible();
      await expect(buttons.same).toBeVisible();
    });

    test("should hide controls when not hovering on desktop", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const otherStack = gamePage.getStack(2, 2);
      const buttons = gamePage.getStackActionButtons(1, 1);

      // Hover over first stack to show controls
      await gamePage.hoverStack(1, 1);
      await expect(buttons.higher).toBeVisible();

      // Hover over different stack
      await gamePage.hoverStack(2, 2);

      // Original stack buttons should be hidden (or at least not visible)
      // Note: This tests the hover-out behavior
      await expect(buttons.higher).not.toBeVisible();
    });

    test("should allow clicking hover controls on desktop", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      // Get initial card count from game state
      const initialCards = await gamePage.getStackCardCount(1, 1);

      // Make move using animation-aware method
      await gamePage.makeHigherMoveAndWait(1, 1);

      // Verify card was added
      const newCards = await gamePage.getStackCardCount(1, 1);
      expect(newCards).toBeGreaterThan(initialCards);
    });

    test("should not show mobile action panel on desktop", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const mobilePanel = gamePage.page.locator(
        '[data-testid="mobile-action-panel"]',
      );

      // Click on stack (this should not trigger mobile panel on desktop)
      await stack.click();

      // Mobile panel should not appear
      await expect(mobilePanel).not.toBeVisible();
    });

    test("should show all three control buttons on hover", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const buttons = gamePage.getStackActionButtons(2, 2);

      await gamePage.hoverStack(2, 2);

      // Verify all three buttons are present and have correct text
      await expect(buttons.higher).toBeVisible();
      await expect(buttons.higher).toContainText("Higher");

      await expect(buttons.lower).toBeVisible();
      await expect(buttons.lower).toContainText("Lower");

      await expect(buttons.same).toBeVisible();
      await expect(buttons.same).toContainText("Same");
    });
  });

  test.describe("Mobile Controls", () => {
    // Force mobile viewport and enable touch
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      isMobile: true,
    });

    test("should not show hover controls on mobile", async ({ gamePage }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const buttons = gamePage.getStackActionButtons(1, 1);

      // Try to hover (should not work on mobile)
      await stack.hover();

      // Buttons should remain hidden
      await expect(buttons.higher).not.toBeVisible();
      await expect(buttons.lower).not.toBeVisible();
      await expect(buttons.same).not.toBeVisible();
    });

    test("should show mobile action panel on tap", async ({ gamePage }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const mobilePanel = gamePage.page.locator(
        '[data-testid="mobile-action-panel"]',
      );

      // Panel should be hidden initially (have translate-y-full class)
      await expect(mobilePanel).toHaveClass(/translate-y-full/, {
        timeout: 3000,
      });

      // Tap on stack
      await stack.tap();

      // Mobile panel should appear (have translate-y-0 class)
      await expect(mobilePanel).toHaveClass(/translate-y-0/, { timeout: 3000 });
    });

    test("should highlight selected stack on mobile", async ({ gamePage }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);

      // Tap on stack
      await stack.tap();

      // Check for selection styling on the correct div (nth(2) has the ring classes)
      const stackInner = stack.locator("div").nth(2);
      await expect(stackInner).toHaveClass(/ring/, { timeout: 3000 });
    });

    test("should show action buttons in mobile panel", async ({ gamePage }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      await stack.tap();

      const mobilePanel = gamePage.page.locator(
        '[data-testid="mobile-action-panel"]',
      );
      await expect(mobilePanel).toBeVisible({ timeout: 3000 });

      // Check for mobile action buttons with timeout
      await expect(async () => {
        await gamePage.assertMobileActionButtonsVisible();
      }).toPass({ timeout: 3000 });
    });

    test("should allow making moves through mobile panel", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      // Get initial card count from game state
      const initialCards = await gamePage.getStackCardCount(1, 1);

      // Make move using animation-aware method (will use mobile approach)
      await gamePage.makeMoveAndWait(1, 1, "higher");

      // Verify card was added
      const newCards = await gamePage.getStackCardCount(1, 1);
      expect(newCards).toBeGreaterThan(initialCards);
    });

    test("should close mobile panel after making move", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const mobilePanel = gamePage.page.locator(
        '[data-testid="mobile-action-panel"]',
      );

      await stack.tap();
      await expect(mobilePanel).toHaveClass(/translate-y-0/, { timeout: 3000 });

      // Make a move
      const buttons = gamePage.getMobileActionButtons();
      await buttons.higher.tap();
      await gamePage.waitForAnimationComplete();

      // Panel should close (have translate-y-full class)
      await expect(mobilePanel).toHaveClass(/translate-y-full/, {
        timeout: 3000,
      });
    });

    test("should switch selection between stacks on mobile", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack1 = gamePage.getStack(1, 1);
      const stack2 = gamePage.getStack(2, 2);

      // Select first stack
      await stack1.tap();
      const stack1Inner = stack1.locator("div").nth(2);
      await expect(stack1Inner).toHaveClass(/ring/, { timeout: 3000 });

      // Close the mobile panel first by tapping outside
      await gamePage.gameBoard.tap({ position: { x: 10, y: 10 } });
      await gamePage.page.waitForTimeout(500); // Wait for panel to close

      // Select second stack
      await stack2.tap();
      const stack2Inner = stack2.locator("div").nth(2);
      await expect(stack2Inner).toHaveClass(/ring/, { timeout: 3000 });

      // First stack should no longer be selected
      await expect(stack1Inner).not.toHaveClass(/ring/, { timeout: 3000 });
    });

    test("should close mobile panel when tapping outside", async ({
      gamePage,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const mobilePanel = gamePage.page.locator(
        '[data-testid="mobile-action-panel"]',
      );

      await stack.tap();
      await expect(mobilePanel).toHaveClass(/translate-y-0/, { timeout: 3000 });

      // Tap outside (on the game board background)
      await gamePage.gameBoard.tap({ position: { x: 10, y: 10 } });

      // Panel should close (have translate-y-full class)
      await expect(mobilePanel).toHaveClass(/translate-y-full/, {
        timeout: 3000,
      });
    });
  });

  test.describe("Cross-Platform Validation", () => {
    test("should use appropriate interaction method based on device", async ({
      gamePage,
      isMobile,
    }) => {
      await gamePage.startNewGame();

      const stack = gamePage.getStack(1, 1);
      const initialCards = await gamePage.getStackCardCount(1, 1);

      // Use cross-platform move method
      await gamePage.makeMoveAndWait(1, 1, "higher");

      // Verify move was successful on both platforms
      const newCards = await gamePage.getStackCardCount(1, 1);
      expect(newCards).toBeGreaterThan(initialCards);
    });

    test("should display correct button text for platform", async ({
      gamePage,
      isMobile,
    }) => {
      const buttonText = await gamePage.startButton.textContent();

      if (isMobile) {
        expect(buttonText).toBe("New Game");
      } else {
        expect(buttonText).toBe("Start New Game");
      }
    });

    test("should handle failed stacks correctly on both platforms", async ({
      gamePage,
      isMobile,
    }) => {
      await gamePage.startNewGame();

      // Force a stack to fail using game state
      const success = await gamePage.forceStackFailed(1, 1);
      expect(success).toBe(true);

      const failedStack = gamePage.getStack(1, 1);
      await expect(failedStack).toHaveAttribute("data-status", "failed");

      if (isMobile) {
        // On mobile, tapping failed stack should not show panel
        await failedStack.tap();
        const mobilePanel = gamePage.page.locator(
          '[data-testid="mobile-action-panel"]',
        );
        // Check that panel remains closed (has translate-y-full class)
        await expect(mobilePanel).toHaveClass(/translate-y-full/, { timeout: 3000 });
      } else {
        // On desktop, hovering failed stack should not show controls
        await failedStack.hover();
        const buttons = gamePage.getStackActionButtons(1, 1);
        await expect(buttons.higher).not.toBeVisible();
      }
    });

    test("should handle responsive layout differences", async ({
      gamePage,
      isMobile,
    }) => {
      await gamePage.startNewGame();

      // Verify all stacks are visible regardless of platform
      for (let row = 1; row <= 3; row++) {
        for (let col = 1; col <= 3; col++) {
          const stack = gamePage.getStack(row, col);
          await expect(stack).toBeVisible();

          // Check that stack has reasonable dimensions
          const box = await stack.boundingBox();
          expect(box).toBeTruthy();
          expect(box!.width).toBeGreaterThan(0);
          expect(box!.height).toBeGreaterThan(0);
        }
      }

      // Mobile should have different spacing/sizing but same functionality
      const gameBoard = await gamePage.gameBoard.boundingBox();
      expect(gameBoard).toBeTruthy();

      if (isMobile) {
        // Mobile viewport should be narrower
        expect(gameBoard!.width).toBeLessThan(800);
      } else {
        // Desktop viewport should be wider
        expect(gameBoard!.width).toBeGreaterThan(800);
      }
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle rapid interactions gracefully", async ({
      gamePage,
      isMobile,
    }) => {
      await gamePage.startNewGame();

      const stack1 = gamePage.getStack(1, 1);
      const stack2 = gamePage.getStack(1, 2);

      if (isMobile) {
        // Rapid taps should switch selection cleanly
        await stack1.tap();
        await stack2.tap();
        await stack1.tap();

        // Final selection should be stack1
        await expect(stack1).toHaveClass(/ring/);
        await expect(stack2).not.toHaveClass(/ring/);
      } else {
        // Rapid hovers should work without issues
        await stack1.hover();
        await stack2.hover();
        await stack1.hover();

        // Controls should be visible on hovered stack
        const buttons = gamePage.getStackActionButtons(1, 1);
        await expect(buttons.higher).toBeVisible();
      }
    });

    test("should maintain state consistency across interactions", async ({
      gamePage,
      isMobile,
    }) => {
      await gamePage.startNewGame();

      // Get initial game state
      const initialState = await gamePage.getGameState();
      expect(initialState).toBeTruthy();

      const stack = gamePage.getStack(1, 1);

      if (isMobile) {
        // Select and deselect without making move
        await stack.tap();
        await gamePage.gameBoard.tap({ position: { x: 10, y: 10 } });
      } else {
        // Hover and unhover without making move
        await stack.hover();
        await gamePage.gameBoard.hover({ position: { x: 10, y: 10 } });
      }

      // Game state should remain unchanged
      const finalState = await gamePage.getGameState();
      expect(finalState!.drawDeck.length).toBe(initialState!.drawDeck.length);
      expect(finalState!.won).toBe(false);
      expect(finalState!.lost).toBe(false);
    });
  });
});

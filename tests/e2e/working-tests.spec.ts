import { test, expect } from './fixtures/gameFixtures';

test.describe('High-Low Game - Working E2E Tests', () => {

  test('should display correct initial state', async ({ gamePage }) => {
    await gamePage.assertInitialState();
  });

  test('should start new game successfully', async ({ gamePage }) => {
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
  });

  test('should restart game correctly', async ({ gamePage }) => {
    // Start first game
    await gamePage.startNewGame();
    await gamePage.assertDeckCount(43);
    
    // Start second game (restart)
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
  });

  test('should display different button text on mobile vs desktop', async ({ gamePage, isMobile }) => {
    const buttonText = await gamePage.startButton.textContent();
    
    if (isMobile) {
      expect(buttonText).toBe('New Game');
    } else {
      expect(buttonText).toBe('Start New Game');
    }
  });

  test('should show correct stack structure', async ({ gamePage }) => {
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
    
    // Additional verification of 3x3 grid structure
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        await expect(gamePage.getStack(row, col)).toBeVisible();
        await expect(gamePage.getStack(row, col)).toHaveAttribute('data-status', 'active');
      }
    }
  });

  test('should handle game state updates correctly', async ({ gamePage }) => {
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
    
    // Test that cards are visible in stacks (count may vary slightly due to animations/deck)
    const cardCount = await gamePage.getAllCards().count();
    expect(cardCount).toBeGreaterThanOrEqual(9); // At least one card per stack
    expect(cardCount).toBeLessThanOrEqual(11); // Allow for some variance
  });

  test('should display consistent UI elements', async ({ gamePage }) => {
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
    
    // Test EZ Mode functionality
    await gamePage.assertEZModeState(false);
    await gamePage.toggleEZMode();
    await gamePage.assertEZModeState(true);
    
    // Test Card Count functionality
    await gamePage.assertCardCountingState(false);
    
    // Verify the game is still functional
    await expect(gamePage.stacks).toHaveCount(9);
  });

  test('should show responsive layout', async ({ gamePage, isMobile }) => {
    await gamePage.startNewGame();
    await gamePage.assertGameStarted();
    
    // Basic layout should work on both mobile and desktop
    for (let i = 0; i < 9; i++) {
      const stack = gamePage.stacks.nth(i);
      const box = await stack.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  // New tests using the improved game state manipulation

  test('should handle win state correctly', async ({ gamePage }) => {
    await gamePage.startNewGame();
    
    // Force win state using helper
    const success = await gamePage.forceWinState();
    expect(success).toBe(true);
    
    // Verify win message appears
    await gamePage.assertWinState();
  });

  test('should handle lose state correctly', async ({ gamePage }) => {
    await gamePage.startNewGame();
    
    // Force lose state using helper
    const success = await gamePage.forceLoseState();
    expect(success).toBe(true);
    
    // Verify lose message appears
    await gamePage.assertLoseState();
  });

  test('should demonstrate game state access', async ({ gamePage }) => {
    await gamePage.startNewGame();
    
    // Get current game state to verify our helper works
    const state = await gamePage.getGameState();
    expect(state).toBeTruthy();
    expect(state!.drawDeck.length).toBe(43);
    expect(state!.won).toBe(false);
    expect(state!.lost).toBe(false);
    
    // Verify all stacks are active
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(state!.stacks[row][col].status).toBe('active');
        expect(state!.stacks[row][col].cards.length).toBe(1);
      }
    }
  });
});
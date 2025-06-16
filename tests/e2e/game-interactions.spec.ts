import { test, expect } from './fixtures/gameFixtures';

test.describe('High-Low Game - Enhanced Interactions', () => {
  
  test('should demonstrate game state manipulation capabilities', async ({ gamePage }) => {
    await gamePage.startNewGame();
    
    // Get initial game state
    const initialState = await gamePage.getGameState();
    expect(initialState).toBeTruthy();
    expect(initialState!.drawDeck.length).toBe(43);
    expect(initialState!.won).toBe(false);
    expect(initialState!.lost).toBe(false);
    
    // Verify all stacks are active initially
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(initialState!.stacks[row][col].status).toBe('active');
      }
    }
    
    // Test win state
    await gamePage.forceWinState();
    await gamePage.assertWinState();
  });

  test('should handle UI feature toggles', async ({ gamePage }) => {
    await gamePage.startNewGame();
    
    // Test EZ Mode toggle
    await gamePage.assertEZModeState(false);
    await gamePage.toggleEZMode();
    await gamePage.assertEZModeState(true);
    await gamePage.toggleEZMode();
    await gamePage.assertEZModeState(false);
    
    // Test Card Counting button
    await gamePage.assertCardCountingState(false);
    await gamePage.toggleCardCounting();
    // After first click, it should enable card counting
  });

  test('should support cross-platform interactions', async ({ gamePage, isMobile }) => {
    await gamePage.startNewGame();
    
    if (!isMobile) {
      // Desktop: test hover interactions
      await gamePage.hoverStack(1, 1);
      const buttons = gamePage.getStackActionButtons(1, 1);
      await expect(buttons.higher).toBeVisible();
      await expect(buttons.lower).toBeVisible();
      await expect(buttons.same).toBeVisible();
    }
    
    // Both mobile and desktop: verify stack structure
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        await expect(gamePage.getStack(row, col)).toBeVisible();
        await expect(gamePage.getStackCards(row, col)).toHaveCount(1);
      }
    }
  });
});
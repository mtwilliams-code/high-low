# High-Low Game E2E Tests

This directory contains comprehensive end-to-end tests for the High-Low Card Game using Playwright and the Page Object Model pattern.

## Structure

### 🏗️ **Architecture**

- **Page Object Model**: Clean separation between test logic and page interactions
- **Fixtures**: Reusable test setup with automatic game state helpers
- **Game State Helpers**: Direct access to application state for advanced testing scenarios

### 📁 **Files**

```
tests/e2e/
├── fixtures/
│   └── gameFixtures.ts          # Test fixtures with gamePage setup
├── helpers/
│   └── gameStateHelper.ts       # Game state manipulation utilities
├── pages/
│   └── HighLowGamePage.ts       # Page Object Model for the game
├── working-tests.spec.ts        # Core functionality tests (55 tests)
├── game-interactions.spec.ts    # Enhanced interaction tests (15 tests)
└── README.md                    # This file
```

## 🧪 **Test Coverage**

### Core Tests (`working-tests.spec.ts`)
- **Initial State**: Page loads correctly with proper elements
- **Game Start**: New game initialization and UI updates
- **Game Restart**: Multiple game sessions work correctly
- **Responsive Design**: Mobile vs desktop button text and layout
- **Stack Structure**: 3x3 grid layout verification
- **Game State Updates**: Real-time state management
- **UI Elements**: EZ Mode and Card Counting toggles
- **Win/Lose States**: End game condition handling
- **Game State Access**: Direct state manipulation verification

### Enhanced Tests (`game-interactions.spec.ts`)
- **State Manipulation**: Advanced game state control
- **Feature Toggles**: EZ Mode and Card Counting functionality
- **Cross-Platform**: Desktop hover vs mobile tap interactions

## 🚀 **Usage**

### Running Tests

```bash
# Run all E2E tests
npx playwright test tests/e2e/

# Run specific test file
npx playwright test tests/e2e/working-tests.spec.ts

# Run with UI mode
npx playwright test tests/e2e/ --ui

# Run with different reporter
npx playwright test tests/e2e/ --reporter=html
```

### Writing New Tests

```typescript
import { test, expect } from './fixtures/gameFixtures';

test.describe('My New Tests', () => {
  test('should do something', async ({ gamePage }) => {
    // Start a game
    await gamePage.startNewGame();
    
    // Assert game state
    await gamePage.assertGameStarted();
    
    // Get a specific stack
    const stack = gamePage.getStack(1, 1);
    
    // Make assertions
    await expect(stack).toBeVisible();
  });
});
```

## 🔧 **Key Features**

### Game State Helpers

The `GameStateHelper` class provides direct access to the application's state management:

```typescript
// Get current game state
const state = await gamePage.getGameState();

// Force win condition
await gamePage.forceWinState();
await gamePage.assertWinState();

// Force lose condition
await gamePage.forceLoseState();
await gamePage.assertLoseState();
```

### Page Object Model

The `HighLowGamePage` class provides a clean interface to interact with the game:

```typescript
// Game actions
await gamePage.startNewGame();
await gamePage.makeMove(1, 1, 'higher');
await gamePage.toggleEZMode();

// Element access
const stack = gamePage.getStack(2, 3);
const cards = gamePage.getStackCards(1, 1);
const buttons = gamePage.getStackActionButtons(1, 1);

// Assertions
await gamePage.assertGameStarted();
await gamePage.assertDeckCount(42);
await gamePage.assertEZModeState(true);
```

### Cross-Platform Support

Tests automatically detect mobile vs desktop environments and use appropriate interaction methods:

- **Desktop**: Hover to reveal controls, then click
- **Mobile**: Tap stack to select, then use action panel

## 📊 **Test Results**

Current status: **70/70 tests passing** ✅

- **working-tests.spec.ts**: 55/55 tests passing
- **game-interactions.spec.ts**: 15/15 tests passing

Tests run across:
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop) 
- ✅ WebKit (Desktop)
- ✅ Mobile Chrome
- ✅ Mobile Safari

## 🛠️ **Maintenance**

### Adding New Tests

1. Use the `gamePage` fixture for all new tests
2. Follow the Page Object Model pattern
3. Use semantic assertion methods when possible
4. Test both mobile and desktop when relevant

### Debugging Tests

1. Use `--headed` flag to see browser actions
2. Use `page.pause()` to debug interactively
3. Check `test-results/` for screenshots and traces
4. Use `--reporter=html` for detailed test reports

### Best Practices

- ✅ Use Page Object Model methods instead of direct selectors
- ✅ Use semantic assertions (`assertGameStarted()` vs manual checks)
- ✅ Test cross-platform compatibility when relevant
- ✅ Keep tests independent and deterministic
- ❌ Don't use `page.evaluate()` unnecessarily - use game state helpers
- ❌ Don't test implementation details - focus on user behavior
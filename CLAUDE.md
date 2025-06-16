# High-Low Card Game - Claude Assistant Knowledge Base

## Quick Commands
- Use `npm run astro check` to check for types etc, not npm run dev. If you want to test what the rendered output looks like, just ask the user to do it
- Use `npm test` to run unit tests
- Use `npm run cli` to test the CLI version of the game

## Game Overview
High-Low is a solitaire-style card game where players try to empty a 52-card deck by correctly guessing if the next card will be higher, lower, or the same rank as cards on a 3x3 grid.

### Core Rules
1. **Initial Setup**: 9 cards dealt face-up in 3x3 grid, 43 cards remain in deck
2. **Card Ranking**: 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < Jack < Queen < King < Ace
3. **Turn**: Select a stack, guess Higher/Lower/Same for the next card
4. **Correct Guess**: Card added to stack, continue playing
5. **Wrong Guess**: Stack becomes "failed" (marked with card back), can't be used
6. **Win**: Empty the entire deck (place all 43 remaining cards)
7. **Lose**: All 9 stacks fail before deck is empty

## Architecture & Code Organization

### State Management (Nanostores)
The game uses clean separation of concerns with nanostores:

1. **gameState.ts** - Core game logic (pure, no UI concerns)
   - `$gameState`: Main game state atom
   - Functions: `startNewGame()`, `makeMove()`, `peekMove()`
   - Types: GameState, PlayerMove, Stacks, Card
   - Includes card counting data for probability calculations

2. **uiState.ts** - UI-specific state
   - Animation states (flying cards, target positions)
   - Panel visibility (card counting panel)
   - EZ mode settings
   - Selected stack for mobile interactions

3. **animationManager.ts** - Animation orchestration
   - Queue-based animation system
   - Motion preference detection
   - Smooth card movements with proper timing

### Component Structure
```
components/
├── Board.tsx                    # Main game board, orchestrates everything
├── Stack.tsx                    # Individual card stack with game logic
├── Card.tsx                     # Card display using @letele/playing-cards
├── BackCard.tsx                 # Card back for deck/failed stacks
├── CardPile.tsx                 # Visual stacking effect (3D depth)
├── Stacks.tsx                   # 3x3 grid layout
├── FlyingCard.tsx              # Animated card during moves
├── AnimatedMoveManager.tsx     # Orchestrates move animations
├── DesktopStackControls.tsx    # Hover controls for desktop
├── MobileActionPanel.tsx       # Bottom sheet for mobile
├── CardCountingPanel.tsx       # Side panel with statistics
└── EZModeButton.tsx            # Toggle for probability display
```

### Key Technical Decisions

1. **No Auto-initialization**: Game doesn't start automatically
   - User must click "Start New Game" 
   - Prevents hydration issues
   - Better user control

2. **Responsive Design**:
   - Desktop: Hover to reveal controls on stacks
   - Mobile/Touch: Tap stack, then use bottom panel
   - Device detection via touch events and viewport size

3. **Animation System**:
   - Queue-based to prevent overlapping animations
   - Respects prefers-reduced-motion
   - Flying card follows from deck to target stack

4. **Card Counting & Probability**:
   - Tracks all visible cards (in stacks)
   - Calculates remaining cards by rank
   - Real-time probability for Higher/Lower/Same
   - EZ mode shows percentages on buttons

## Important Implementation Details

### Game State Structure
```typescript
interface GameState {
  drawDeck: Card[];          // Remaining cards (face down)
  stacks: Stacks;            // 3x3 grid of stacks
  won: boolean;              // All cards placed successfully
  lost: boolean;             // All stacks failed
  cardCounting: {
    seenCards: Card[];       // All visible cards
    cardCounts: Map<rank, count>;
    probabilities: null;     // Calculated on demand
  }
}
```

### Stack Structure
```typescript
interface Stack {
  cards: Card[];             // Bottom to top order
  status: 'active' | 'failed';
}
```

### Mobile Considerations
- Haptic feedback on iOS (via Haptics API)
- Touch-optimized tap targets
- Bottom sheet pattern for action selection
- Larger cards on small screens

### Testing Challenges
- E2E tests have Chromium-specific issues with button clicks
- Game initialization timing is tricky in tests
- Use `startNewGame()` explicitly in tests since no auto-init

## Common Tasks & Solutions

### Adding a New Feature
1. Decide if it's game logic (gameState.ts) or UI (uiState.ts)
2. Update the appropriate store
3. Create/modify components as needed
4. Add tests for game logic
5. Consider mobile experience

### Debugging State Issues
- Use browser DevTools with nanostores devtools
- Check hydration mismatches (especially with deck initialization)
- Verify animation queue isn't stuck

### Performance Considerations
- Card components use React.memo
- Animations use CSS transforms (GPU accelerated)
- Probability calculations are memoized

## CLI Version
- Located in `cli.js`
- Uses same game logic from gameState.ts
- Interactive prompts with @inquirer/prompts
- Colored output with chalk
- Good for testing game logic without UI

## Future Enhancements (Documented)
1. **Animation Enhancement** - Smooth card movements, queue system
2. **Card Counting** - Statistical panel, probability display
3. **EZ Modes** - Show probabilities, AI suggestions
4. **Mobile Friendly** - Touch optimization, responsive design
5. **Monte Carlo Analysis** - Strategy optimization, win rate calculation

## Known Gotchas
1. **Hydration**: Initial game state must match server/client
2. **Touch Events**: Some devices report as touch but use mouse
3. **Animation Timing**: Must account for reduced motion preference
4. **Probability Edge Cases**: Same rank probability changes as cards are seen
5. **Test Stability**: Chromium has issues with synthetic clicks
# Animation Enhancement Plan

## Overview

This document outlines the plan for adding smooth animations to card moves in the High-Low card game, focusing on native browser technologies for optimal performance and reliability.

## Current State

Currently, when a player makes a move (Higher/Lower/Same):
- The game state updates immediately
- The UI re-renders instantly with the new card
- No visual feedback shows the card moving from deck to stack

## Animation Goals

1. **Visual Feedback**: Show cards moving from deck to target stack
2. **Game Feel**: Make the game feel more tactile and responsive
3. **Card Reveal**: Display the actual drawn card during the animation
4. **Native Performance**: Use browser-native animation APIs
5. **Accessibility**: Allow users to disable animations if needed

## Animation Sequence

When a player makes a move:

1. **Initiate Move** - Player clicks Higher/Lower/Same button
2. **Draw Card** - Get the card that would be drawn (without updating state)
3. **Show Flying Card** - Display the drawn card at deck position
4. **Animate Movement** - Card flies from deck to target stack
5. **Update State** - Apply the actual game state changes
6. **Clean Up** - Remove the flying card element

## Implementation Approaches

### Recommended: Staged State Updates

**Why This Approach:**
- Clean separation between animation and game logic
- Easy to show the actual drawn card during flight
- Reliable across all browsers
- Simple to implement incrementally
- Easy to disable for accessibility

**Implementation Strategy:**
```typescript
// 1. Modify makeMove to return drawn card without state update
function peekMove(move: PlayerMove): Card {
  // Return what card would be drawn without updating state
}

// 2. Add animation state
interface AnimationState {
  isAnimating: boolean;
  flyingCard: Card | null;
  targetPosition: { row: number; column: number } | null;
}

// 3. Animation sequence
async function animatedMove(move: PlayerMove) {
  const drawnCard = peekMove(move);
  showFlyingCard(drawnCard, deckPosition, stackPosition);
  await animateCardFlight();
  actuallyMakeMove(move);
  hideFlyingCard();
}
```

### Alternative Approaches Considered

#### FLIP (First, Last, Invert, Play) Technique
- **Pros**: Very smooth, handles complex state changes
- **Cons**: More complex to implement, harder to show drawn card
- **Use Case**: Better for rearranging existing elements

#### CSS View Transitions API
- **Pros**: Most "native", minimal code required
- **Cons**: Limited browser support (Chrome 111+), less control
- **Use Case**: Future consideration when browser support improves

## Technical Implementation

### Animation Technologies

**Primary: Web Animations API**
```javascript
element.animate([
  { transform: 'translate(0, 0)', opacity: 1 },
  { transform: 'translate(200px, 100px)', opacity: 1 }
], {
  duration: 400,
  easing: 'ease-out'
});
```

**Fallback: CSS Transitions**
```css
.flying-card {
  transition: transform 0.4s ease-out;
}
```

### Positioning Strategy

1. **Get Coordinates**: Use `getBoundingClientRect()` for deck and stack positions
2. **Absolute Positioning**: Flying card positioned absolutely over the game board
3. **Transform Animation**: Use CSS `transform: translate()` for smooth movement
4. **Z-Index Management**: Ensure flying card appears above other elements

### State Management Changes

```typescript
// Add to game state
interface GameState {
  // ... existing properties
  animation: {
    isAnimating: boolean;
    flyingCard: Card | null;
    sourcePosition: DOMRect | null;
    targetPosition: DOMRect | null;
  };
}

// Add animation controls
function startCardAnimation(card: Card, from: DOMRect, to: DOMRect): Promise<void>
function endCardAnimation(): void
```

### Component Updates

#### New Components
- `FlyingCard.tsx` - Renders the animated card
- `AnimationProvider.tsx` - Context for animation state

#### Modified Components
- `Stack.tsx` - Disable interactions during animation
- `Board.tsx` - Render flying card overlay
- `gameState.ts` - Add animation-aware move functions

## Performance Considerations

### Optimization Strategies
- **GPU Acceleration**: Use `transform` instead of changing `left`/`top`
- **Avoid Layout Thrashing**: Minimize DOM reads during animation
- **RequestAnimationFrame**: For any manual animation calculations
- **Transform Composite Layers**: Use `will-change: transform` when needed

### Animation Timing
- **Duration**: 300-500ms for optimal game flow
- **Easing**: `ease-out` for natural deceleration
- **Stagger**: 50-100ms delays for multiple simultaneous updates

## Accessibility

### User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  .flying-card {
    transition: none;
    animation-duration: 0.01ms;
  }
}
```

### Implementation
- Check `window.matchMedia('(prefers-reduced-motion: reduce)')`
- Provide settings toggle for animation preferences
- Ensure all functionality works with animations disabled

## Development Phases

### Phase 1: Basic Flying Card
- [ ] Implement flying card animation for successful moves
- [ ] Add animation state management
- [ ] Test cross-browser compatibility

### Phase 2: Enhanced Feedback
- [ ] Different animations for failed moves
- [ ] Stack pile effect animations
- [ ] Win/lose celebration animations

### Phase 3: Polish & Optimization
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Animation preferences UI

### Phase 4: Advanced Effects
- [ ] Card flip animations for reveals
- [ ] Particle effects for celebrations
- [ ] Sound integration hooks

## Testing Strategy

### Manual Testing
- [ ] Test on different screen sizes
- [ ] Verify performance on lower-end devices
- [ ] Test with reduced motion preferences
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### Automated Testing
- [ ] Unit tests for animation state management
- [ ] Integration tests for animation sequences
- [ ] Visual regression tests for animation endpoints

## Future Considerations

### Potential Enhancements
- **3D Transforms**: Card flipping effects using CSS 3D transforms
- **Physics**: Spring animations using libraries like Framer Motion
- **Gesture Support**: Touch-based card dragging on mobile
- **Sound Effects**: Audio feedback for card movements

### Browser API Evolution
- **View Transitions**: Adopt when browser support improves
- **Animation Worklet**: For complex physics-based animations
- **Web Animations API Level 2**: Group effects and improved timing

## Success Metrics

### User Experience
- Smooth 60fps animations on target devices
- No perceived delay in game responsiveness
- Intuitive visual feedback for all game actions

### Technical
- < 100ms animation initialization time
- < 5MB memory overhead for animation state
- No layout shifts during animations
- Graceful fallback for unsupported browsers
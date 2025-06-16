# Card Counting Enhancement Plan

## Overview

This document outlines the plan for adding a card counting and probability calculation feature to the High-Low card game. This enhancement will provide players with statistical information about remaining cards and betting odds.

## Feature Goals

1. **Card Tracking**: Track which cards have been seen (played to stacks)
2. **Probability Calculator**: Show odds for Higher/Lower/Same outcomes
3. **Visual Analytics**: Display card distribution and statistics
4. **EZ Mode**: Show probabilities directly on game buttons
5. **Toggle Interface**: Collapsible side panel for advanced stats

## Current Game State

### What We Know
- **Total deck**: 52 cards (4 suits × 13 ranks)
- **Cards dealt**: 9 cards initially placed on stacks
- **Cards remaining**: Tracked in `state.drawDeck.length`
- **Visible cards**: All cards currently on top of stacks

### What We Need to Track
- **Cards seen**: All cards that have been played (including those under other cards)
- **Cards remaining per rank**: Count of each rank still in the deck
- **Probability calculations**: Odds based on remaining cards

## Feature Components

### 1. Card Counting Panel

**Location**: Collapsible side panel (right side of game board)

**Content Sections**:
- **Deck Status**: Cards remaining, cards seen
- **Rank Distribution**: Visual chart of remaining cards per rank
- **Probability Calculator**: Odds for next card outcomes
- **Statistics**: Running totals and success rates

**Visual Design**:
```
┌─ Card Statistics ────────────┐
│ Deck: 31 cards remaining     │
│ Seen: 21 cards               │
│                              │
│ ┌─ Remaining Cards ─────┐    │
│ │ A: ████ (4)           │    │
│ │ K: ███  (3)           │    │
│ │ Q: ██   (2)           │    │
│ │ J: █    (1)           │    │
│ │ 10: ████ (4)          │    │
│ │ ...                   │    │
│ └───────────────────────┘    │
│                              │
│ ┌─ Current Odds ────────┐    │
│ │ Higher: 67.7% (21/31) │    │
│ │ Same:   12.9% (4/31)  │    │
│ │ Lower:  19.4% (6/31)  │    │
│ └───────────────────────┘    │
└──────────────────────────────┘
```

### 2. EZ Mode Integration

**Button Enhancement**: Show probability percentages on hover/always visible

```typescript
// Enhanced button display
<button className="...">
  Higher
  {ezMode && <span className="text-xs">67%</span>}
</button>
```

**Visual States**:
- **Disabled**: When EZ mode is off
- **Hover**: Show probability on hover
- **Always On**: Persistent probability display
- **Color Coding**: Green (good odds), Yellow (moderate), Red (poor)

### 3. Settings Integration

**Toggle Controls**:
- Card counting panel (show/hide)
- EZ mode (probability display)
- Advanced statistics
- Reset statistics

## Technical Implementation

### Data Structures

```typescript
interface CardCount {
  rank: CardRank;
  remaining: number;
  total: number;
  seen: number;
}

interface ProbabilityCalculation {
  higher: number;    // Probability as decimal (0-1)
  lower: number;
  same: number;
  total: number;     // Total cards remaining
}

interface CardCountingState {
  enabled: boolean;
  ezMode: boolean;
  cardCounts: CardCount[];
  visibleCards: Card[];     // All cards currently visible
  seenCards: Card[];        // All cards that have been played
  probabilities: ProbabilityCalculation;
}
```

### Game State Integration

```typescript
// Extend existing GameState
interface GameState {
  // ... existing properties
  cardCounting: CardCountingState;
}

// New functions
function updateSeenCards(newCard: Card): void;
function calculateProbabilities(currentCard: Card, remainingDeck: Card[]): ProbabilityCalculation;
function getCardCounts(seenCards: Card[]): CardCount[];
function getRemainingCards(seenCards: Card[]): Card[];
```

### Probability Calculations

```typescript
function calculateProbabilities(currentCard: Card, remainingCards: Card[]): ProbabilityCalculation {
  const currentRank = getRankValue(currentCard.rank);
  
  let higher = 0;
  let lower = 0;
  let same = 0;
  
  remainingCards.forEach(card => {
    const cardRank = getRankValue(card.rank);
    if (cardRank > currentRank) higher++;
    else if (cardRank < currentRank) lower++;
    else same++;
  });
  
  const total = remainingCards.length;
  
  return {
    higher: total > 0 ? higher / total : 0,
    lower: total > 0 ? lower / total : 0,
    same: total > 0 ? same / total : 0,
    total
  };
}
```

### Card Tracking Logic

```typescript
// Track cards when they become visible
function trackCardSeen(card: Card): void {
  const state = $gameState.get();
  const newSeenCards = [...state.cardCounting.seenCards, card];
  
  $gameState.set({
    ...state,
    cardCounting: {
      ...state.cardCounting,
      seenCards: newSeenCards,
      cardCounts: getCardCounts(newSeenCards),
      probabilities: calculateProbabilities(
        getCurrentTopCard(), 
        getRemainingCards(newSeenCards)
      )
    }
  });
}
```

## Component Architecture

### New Components

#### `CardCountingPanel.tsx`
```typescript
interface CardCountingPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  cardCounts: CardCount[];
  probabilities: ProbabilityCalculation;
}
```

#### `RankDistributionChart.tsx`
```typescript
interface RankDistributionChartProps {
  cardCounts: CardCount[];
  highlightRank?: CardRank;
}
```

#### `ProbabilityDisplay.tsx`
```typescript
interface ProbabilityDisplayProps {
  probabilities: ProbabilityCalculation;
  currentCard: Card;
  compact?: boolean; // For button integration
}
```

#### `EZModeButton.tsx`
```typescript
interface EZModeButtonProps {
  action: 'higher' | 'lower' | 'same';
  probability: number;
  onClick: () => void;
  ezMode: boolean;
}
```

### Modified Components

#### `Stack.tsx`
- Track when new cards become visible
- Update seen cards list
- Trigger probability recalculation

#### `Board.tsx`
- Add card counting panel
- Integrate settings toggles
- Manage panel state

#### `gameState.ts`
- Add card counting state management
- Implement probability calculations
- Track seen cards across game sessions

## User Interface Design

### Panel Layout
```
Game Board                    │ Card Stats Panel
                             │
┌─────────────────────────┐   │ ┌─ Toggle Controls ──┐
│                         │   │ │ [×] Card Counting  │
│     [Deck: 31]          │   │ │ [×] EZ Mode        │
│                         │   │ │ [×] Advanced Stats │
│   ┌───┐ ┌───┐ ┌───┐     │   │ └────────────────────┘
│   │ 7♠│ │ K♥│ │ 2♣│     │   │
│   └───┘ └───┘ └───┘     │   │ ┌─ Remaining Cards ──┐
│                         │   │ │ A: ████ (4/4)      │
│   ┌───┐ ┌───┐ ┌───┐     │   │ │ K: ███  (3/4)      │
│   │ 9♦│ │ A♠│ │ 5♥│     │   │ │ Q: ██   (2/4)      │
│   └───┘ └───┘ └───┘     │   │ │ J: █    (1/4)      │
│                         │   │ │ 10: ████ (4/4)     │
│   ┌───┐ ┌───┐ ┌───┐     │   │ │ 9: ███  (3/4)      │
│   │ J♣│ │ 3♦│ │ 8♠│     │   │ │ 8: ██   (2/4)      │
│   └───┘ └───┘ └───┘     │   │ │ 7: █    (1/4)      │
│                         │   │ │ 6: ████ (4/4)      │
└─────────────────────────┘   │ │ 5: ███  (3/4)      │
                             │ │ 4: ████ (4/4)      │
                             │ │ 3: ███  (3/4)      │
                             │ │ 2: ███  (3/4)      │
                             │ └────────────────────┘
                             │
                             │ ┌─ Current Odds ─────┐
                             │ │ vs 7♠:             │
                             │ │ Higher: 67% (21/31)│
                             │ │ Same:   13% (4/31) │
                             │ │ Lower:  19% (6/31) │
                             │ └────────────────────┘
```

### EZ Mode Button Enhancement
```
Normal Mode:     EZ Mode:
┌─────────┐     ┌─────────┐
│ Higher  │     │ Higher  │
│         │     │  67%    │
└─────────┘     └─────────┘
```

## Data Persistence

### Local Storage Strategy
```typescript
interface StoredCardCountingData {
  gameSession: string;
  seenCards: Card[];
  preferences: {
    panelOpen: boolean;
    ezMode: boolean;
    advancedStats: boolean;
  };
}
```

### Session Management
- Track cards across game restarts
- Reset option for new learning sessions
- Export/import functionality for advanced users

## Performance Considerations

### Optimization Strategies
- **Memoized Calculations**: Cache probability calculations
- **Efficient Updates**: Only recalculate when deck changes
- **Virtual Scrolling**: For large card history lists
- **Debounced Updates**: Batch rapid state changes

```typescript
// Memoized probability calculation
const memoizedProbabilities = useMemo(() => {
  return calculateProbabilities(currentCard, remainingCards);
}, [currentCard, remainingCards.length]);
```

## Accessibility

### Screen Reader Support
- Announce probability changes
- Describe chart data
- Provide text alternatives for visual charts

### Keyboard Navigation
- Tab through statistics
- Keyboard shortcuts for toggles
- Focus management in panel

### Visual Accessibility
- High contrast mode for charts
- Scalable text and numbers
- Color-blind friendly palettes

## Testing Strategy

### Unit Tests
```typescript
describe('Probability Calculations', () => {
  it('should calculate correct higher probability', () => {
    const currentCard = { suit: 'Hearts', rank: '7' };
    const remainingCards = [/* test deck */];
    const prob = calculateProbabilities(currentCard, remainingCards);
    expect(prob.higher).toBeCloseTo(0.677, 3);
  });
});
```

### Integration Tests
- Panel open/close functionality
- EZ mode toggle behavior
- Card tracking accuracy
- Probability updates on game state changes

### Manual Testing
- Verify calculations against hand calculations
- Test with different deck compositions
- Validate edge cases (empty deck, single card)

## Development Phases

### Phase 1: Core Tracking
- [ ] Implement card seen tracking
- [ ] Basic probability calculations
- [ ] Simple statistics display

### Phase 2: UI Integration
- [ ] Card counting panel component
- [ ] Toggle controls
- [ ] Basic EZ mode implementation

### Phase 3: Enhanced Features
- [ ] Visual charts and graphs
- [ ] Advanced statistics
- [ ] Data persistence

### Phase 4: Polish & Optimization
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Advanced EZ mode features

## Future Enhancements

### Advanced Statistics
- **Success Rate Tracking**: Win/loss ratios with different strategies
- **Optimal Play Suggestions**: AI-powered recommendations
- **Historical Analysis**: Game session comparisons
- **Strategy Testing**: Simulate different playing approaches

### Educational Features
- **Tutorial Mode**: Explain probability concepts
- **Practice Scenarios**: Set up specific deck compositions
- **Quiz Mode**: Test probability estimation skills
- **Learning Progress**: Track improvement over time

### Social Features
- **Leaderboards**: Compare success rates
- **Challenge Mode**: Compete with friends
- **Strategy Sharing**: Export/import playing strategies
- **Community Stats**: Anonymous aggregate data
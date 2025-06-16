# EZ Mode Enhancement Plan

## Overview

This document outlines the plan for implementing an "EZ Mode" feature that displays probability percentages directly on the Higher/Lower/Same buttons, making the game more accessible to new players and providing real-time statistical guidance.

## Feature Goals

1. **Accessibility**: Make probability calculations visible to all players
2. **Educational**: Help players understand card counting and odds
3. **Configurable**: Toggle on/off based on player preference
4. **Non-Intrusive**: Enhance without cluttering the interface
5. **Performance**: Real-time calculations without lag

## Current Button Interface

### Desktop (Hover State)
```
Stack with hover overlay:
┌─────────────────┐
│ ┌─────────────┐ │
│ │   Higher    │ │ ← Green overlay
│ ├─────────────┤ │
│ │    Same     │ │ ← Yellow overlay  
│ ├─────────────┤ │
│ │   Lower     │ │ ← Red overlay
│ └─────────────┘ │
└─────────────────┘
```

### Mobile (Selected State)
```
Selected stack + action panel:
┌─────────────────────────┐
│ Stack 2,3 - 7♠          │
├─────────────────────────┤
│ [Higher] [Same] [Lower] │
└─────────────────────────┘
```

## EZ Mode Interface Design

### Desktop Enhancement
```
Normal Mode:          EZ Mode:
┌─────────────┐      ┌─────────────┐
│   Higher    │      │   Higher    │
│             │  →   │    67%      │
└─────────────┘      └─────────────┘

┌─────────────┐      ┌─────────────┐
│    Same     │      │    Same     │
│             │  →   │    13%      │
└─────────────┘      └─────────────┘

┌─────────────┐      ┌─────────────┐
│   Lower     │      │   Lower     │
│             │  →   │    19%      │
└─────────────┘      └─────────────┘
```

### Mobile Enhancement
```
Normal Mode:
┌───────────┬───────────┬───────────┐
│  Higher   │   Same    │   Lower   │
│           │           │           │
└───────────┴───────────┴───────────┘

EZ Mode:
┌───────────┬───────────┬───────────┐
│  Higher   │   Same    │   Lower   │
│   67%     │   13%     │   19%     │
└───────────┴───────────┴───────────┘

EZ Mode + Color Coding:
┌───────────┬───────────┬───────────┐
│  Higher   │   Same    │   Lower   │
│   67% ✓   │   13% ⚠   │   19% ✗   │
└───────────┴───────────┴───────────┘
```

## Probability Display Variations

### Display Modes

#### 1. Percentage Only
```typescript
interface BasicProbabilityDisplay {
  percentage: string;     // "67%"
}
```

#### 2. Percentage + Fraction
```typescript
interface DetailedProbabilityDisplay {
  percentage: string;     // "67%"
  fraction: string;       // "(21/31)"
}
```

#### 3. Color-Coded Confidence
```typescript
interface ColorCodedDisplay {
  percentage: string;     // "67%"
  confidence: 'high' | 'medium' | 'low' | 'very-low';
  icon?: string;         // "✓", "⚠", "✗"
}
```

### Color Coding Strategy

```css
.probability-display {
  /* High confidence: 60%+ */
  &.confidence-high {
    background-color: #10b981;  /* Green */
    color: white;
  }
  
  /* Medium confidence: 35-59% */
  &.confidence-medium {
    background-color: #f59e0b;  /* Amber */
    color: white;
  }
  
  /* Low confidence: 20-34% */
  &.confidence-low {
    background-color: #ef4444;  /* Red */
    color: white;
  }
  
  /* Very low confidence: <20% */
  &.confidence-very-low {
    background-color: #6b7280;  /* Gray */
    color: white;
  }
}
```

## Component Implementation

### Enhanced Action Button Component

```typescript
interface EZModeButtonProps {
  action: 'higher' | 'lower' | 'same';
  probability: number;
  ezMode: boolean;
  displayMode: 'percentage' | 'detailed' | 'color-coded';
  onClick: () => void;
  disabled?: boolean;
}

const EZModeButton: FC<EZModeButtonProps> = ({
  action,
  probability,
  ezMode,
  displayMode,
  onClick,
  disabled = false
}) => {
  const getConfidenceLevel = (prob: number): 'high' | 'medium' | 'low' | 'very-low' => {
    if (prob >= 0.6) return 'high';
    if (prob >= 0.35) return 'medium';
    if (prob >= 0.2) return 'low';
    return 'very-low';
  };

  const getDisplayContent = () => {
    if (!ezMode) {
      return {
        primary: action.charAt(0).toUpperCase() + action.slice(1),
        secondary: null
      };
    }

    const percentage = `${Math.round(probability * 100)}%`;
    const confidence = getConfidenceLevel(probability);

    switch (displayMode) {
      case 'percentage':
        return {
          primary: action.charAt(0).toUpperCase() + action.slice(1),
          secondary: percentage
        };

      case 'detailed':
        // Calculate fraction (requires remaining cards context)
        const totalRemaining = 31; // This would come from game state
        const favorableCards = Math.round(probability * totalRemaining);
        return {
          primary: action.charAt(0).toUpperCase() + action.slice(1),
          secondary: `${percentage} (${favorableCards}/${totalRemaining})`
        };

      case 'color-coded':
        const icons = {
          'high': '✓',
          'medium': '⚠',
          'low': '✗',
          'very-low': '✗'
        };
        return {
          primary: action.charAt(0).toUpperCase() + action.slice(1),
          secondary: `${percentage} ${icons[confidence]}`
        };
    }
  };

  const { primary, secondary } = getDisplayContent();
  const confidence = ezMode ? getConfidenceLevel(probability) : null;

  const baseColors = {
    higher: 'bg-green-500 hover:bg-green-600',
    same: 'bg-yellow-500 hover:bg-yellow-600',
    lower: 'bg-red-500 hover:bg-red-600'
  };

  const confidenceColors = {
    'high': 'bg-green-600 hover:bg-green-700',
    'medium': 'bg-amber-500 hover:bg-amber-600',
    'low': 'bg-red-500 hover:bg-red-600',
    'very-low': 'bg-gray-500 hover:bg-gray-600'
  };

  const buttonColor = ezMode && confidence 
    ? confidenceColors[confidence] 
    : baseColors[action];

  return (
    <button
      className={`
        ${buttonColor}
        text-white font-bold py-3 px-4 rounded-lg
        min-h-[60px] min-w-[100px]
        flex flex-col items-center justify-center
        transform transition-all duration-150
        active:scale-95
        shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${ezMode ? 'text-sm' : 'text-base'}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${primary}${secondary ? `, ${secondary} probability` : ''}`}
    >
      <span className={ezMode ? 'text-base' : 'text-lg'}>
        {primary}
      </span>
      {secondary && ezMode && (
        <span className="text-xs opacity-90 mt-1">
          {secondary}
        </span>
      )}
    </button>
  );
};
```

### Settings Integration

```typescript
interface EZModeSettings {
  enabled: boolean;
  displayMode: 'percentage' | 'detailed' | 'color-coded';
  colorByConfidence: boolean;
  showFractions: boolean;
  minimumProbabilityThreshold: number; // Don't show if below this threshold
}

const EZModeSettingsPanel: FC<{
  settings: EZModeSettings;
  onChange: (settings: EZModeSettings) => void;
}> = ({ settings, onChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">EZ Mode Settings</h3>
      
      <div className="space-y-4">
        {/* Enable/Disable */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onChange({
              ...settings,
              enabled: e.target.checked
            })}
          />
          <span>Enable EZ Mode (show probabilities)</span>
        </label>

        {settings.enabled && (
          <>
            {/* Display Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Mode
              </label>
              <select
                value={settings.displayMode}
                onChange={(e) => onChange({
                  ...settings,
                  displayMode: e.target.value as EZModeSettings['displayMode']
                })}
                className="w-full p-2 border rounded"
              >
                <option value="percentage">Percentage Only</option>
                <option value="detailed">Percentage + Fraction</option>
                <option value="color-coded">Color Coded + Icons</option>
              </select>
            </div>

            {/* Color by Confidence */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.colorByConfidence}
                onChange={(e) => onChange({
                  ...settings,
                  colorByConfidence: e.target.checked
                })}
              />
              <span>Color buttons by confidence level</span>
            </label>

            {/* Minimum Threshold */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Probability to Display: {settings.minimumProbabilityThreshold}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.minimumProbabilityThreshold}
                onChange={(e) => onChange({
                  ...settings,
                  minimumProbabilityThreshold: parseInt(e.target.value)
                })}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Hide probabilities below this threshold to reduce clutter
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

## Desktop Hover Integration

### Enhanced Stack Component

```typescript
const DesktopStackComponent: FC<StackComponentProps> = ({
  cards,
  status,
  row,
  column,
  ezMode,
  ezModeSettings
}) => {
  const [probabilities, setProbabilities] = useState<ProbabilityCalculation | null>(null);

  useEffect(() => {
    if (ezMode && status === 'active' && cards.length > 0) {
      const topCard = cards[cards.length - 1];
      const calc = calculateProbabilities(topCard, getRemainingCards());
      setProbabilities(calc);
    }
  }, [cards, ezMode, status]);

  if (status === 'failed') {
    return (
      <CardPile count={cards.length}>
        <BackCardComponent />
      </CardPile>
    );
  }

  return (
    <CardPile count={cards.length}>
      <div className="relative group">
        <CardComponent {...topCard} />
        
        {/* Enhanced hover overlay with EZ Mode */}
        <div className="absolute inset-0 transition-opacity duration-200 z-10 hidden md:flex flex-col rounded-md overflow-clip opacity-0 group-hover:opacity-100">
          
          {/* Higher button */}
          <EZModeButton
            action="higher"
            probability={probabilities?.higher || 0}
            ezMode={ezMode}
            displayMode={ezModeSettings.displayMode}
            onClick={() => handleGuess('higher')}
            disabled={!probabilities}
          />

          {/* Same button */}
          <EZModeButton
            action="same"
            probability={probabilities?.same || 0}
            ezMode={ezMode}
            displayMode={ezModeSettings.displayMode}
            onClick={() => handleGuess('same')}
            disabled={!probabilities}
          />

          {/* Lower button */}
          <EZModeButton
            action="lower"
            probability={probabilities?.lower || 0}
            ezMode={ezMode}
            displayMode={ezModeSettings.displayMode}
            onClick={() => handleGuess('lower')}
            disabled={!probabilities}
          />
        </div>
      </div>
    </CardPile>
  );
};
```

## Probability Calculation Integration

### Real-time Updates

```typescript
// Hook for real-time probability calculations
const useProbabilityCalculations = (currentCard: Card | null, ezMode: boolean) => {
  const [probabilities, setProbabilities] = useState<ProbabilityCalculation | null>(null);
  const gameState = useStore($gameState);

  useEffect(() => {
    if (!ezMode || !currentCard) {
      setProbabilities(null);
      return;
    }

    const calculateCurrentProbabilities = () => {
      // Get all visible cards (including cards in stacks)
      const visibleCards = getAllVisibleCards(gameState.stacks);
      
      // Calculate remaining deck composition
      const remainingCards = getRemainingCards(visibleCards);
      
      // Calculate probabilities for this specific card
      const calc = calculateProbabilities(currentCard, remainingCards);
      
      setProbabilities(calc);
    };

    calculateCurrentProbabilities();
  }, [currentCard, ezMode, gameState.stacks, gameState.drawDeck.length]);

  return probabilities;
};

// Utility functions
function getAllVisibleCards(stacks: Stacks): Card[] {
  const visibleCards: Card[] = [];
  
  stacks.forEach(row => {
    row.forEach(stack => {
      // Add all cards in each stack (not just top card)
      visibleCards.push(...stack.cards);
    });
  });
  
  return visibleCards;
}

function getRemainingCards(seenCards: Card[]): Card[] {
  // Start with full deck
  const fullDeck = generateFullDeck();
  
  // Remove seen cards
  const remaining = fullDeck.filter(card => {
    return !seenCards.some(seenCard => 
      seenCard.suit === card.suit && seenCard.rank === card.rank
    );
  });
  
  return remaining;
}
```

### Performance Optimization

```typescript
// Memoized probability calculations
const useMemoizedProbabilities = (currentCard: Card | null, seenCards: Card[]) => {
  return useMemo(() => {
    if (!currentCard) return null;
    
    const remainingCards = getRemainingCards(seenCards);
    return calculateProbabilities(currentCard, remainingCards);
  }, [currentCard, seenCards.length]); // Only recalculate when card changes or deck size changes
};

// Debounced updates for rapid state changes
const useDebouncedProbabilities = (currentCard: Card | null, delay: number = 100) => {
  const [debouncedCard, setDebouncedCard] = useState(currentCard);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCard(currentCard);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentCard, delay]);

  return useMemoizedProbabilities(debouncedCard, getAllVisibleCards($gameState.get().stacks));
};
```

## Educational Features

### Tutorial Integration

```typescript
const EZModeTutorial: FC<{
  isVisible: boolean;
  onComplete: () => void;
}> = ({ isVisible, onComplete }) => {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to EZ Mode!",
      content: "EZ Mode shows you the probability of each outcome to help you make better decisions.",
      highlight: null
    },
    {
      title: "Probability Percentages",
      content: "Each button now shows the percentage chance that the next card will be higher, lower, or the same.",
      highlight: ".ez-mode-button"
    },
    {
      title: "Color Coding",
      content: "Green means good odds (60%+), yellow means moderate (35-59%), and red means poor odds (<35%).",
      highlight: ".confidence-colors"
    },
    {
      title: "Making Decisions",
      content: "Use these probabilities to make informed guesses. Higher percentages mean better chances of success!",
      highlight: null
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {tutorialSteps[step].title}
        </h2>
        <p className="mb-6">
          {tutorialSteps[step].content}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {step + 1} of {tutorialSteps.length}
          </span>
          
          <div className="space-x-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
            )}
            
            {step < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Probability Explanation Panel

```typescript
const ProbabilityExplanationPanel: FC<{
  currentCard: Card;
  probabilities: ProbabilityCalculation;
  remainingCards: Card[];
}> = ({ currentCard, probabilities, remainingCards }) => {
  const currentRankValue = getRankValue(currentCard.rank);
  
  const higherCards = remainingCards.filter(card => 
    getRankValue(card.rank) > currentRankValue
  );
  const lowerCards = remainingCards.filter(card => 
    getRankValue(card.rank) < currentRankValue
  );
  const sameCards = remainingCards.filter(card => 
    getRankValue(card.rank) === currentRankValue
  );

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold mb-2">Why these odds?</h4>
      <div className="text-sm space-y-1">
        <p>
          <strong>Higher than {currentCard.rank}:</strong> {higherCards.length} cards remaining 
          ({Math.round(probabilities.higher * 100)}%)
        </p>
        <p>
          <strong>Same as {currentCard.rank}:</strong> {sameCards.length} cards remaining 
          ({Math.round(probabilities.same * 100)}%)
        </p>
        <p>
          <strong>Lower than {currentCard.rank}:</strong> {lowerCards.length} cards remaining 
          ({Math.round(probabilities.lower * 100)}%)
        </p>
        <p className="pt-2 border-t border-blue-200">
          <strong>Total cards left:</strong> {remainingCards.length}
        </p>
      </div>
    </div>
  );
};
```

## Accessibility Considerations

### Screen Reader Support

```typescript
const AccessibleEZModeButton: FC<EZModeButtonProps> = (props) => {
  const { action, probability, ezMode } = props;
  
  const ariaLabel = ezMode 
    ? `${action}, ${Math.round(probability * 100)} percent probability`
    : action;
    
  const ariaDescription = ezMode
    ? `This action has a ${Math.round(probability * 100)} percent chance of being correct based on the remaining cards.`
    : undefined;

  return (
    <EZModeButton
      {...props}
      aria-label={ariaLabel}
      aria-description={ariaDescription}
    />
  );
};
```

### Keyboard Navigation

```typescript
const useEZModeKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1':
            // Show/hide probability details
            toggleProbabilityDetails();
            break;
          case '2':
            // Toggle EZ mode
            toggleEZMode();
            break;
          case '3':
            // Show probability explanation
            showProbabilityExplanation();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

## Testing Strategy

### Unit Tests

```typescript
describe('EZ Mode Probability Calculations', () => {
  it('should calculate correct probabilities for mid-range card', () => {
    const currentCard = { suit: 'Hearts', rank: '7' };
    const remainingCards = generateTestDeck();
    
    const probabilities = calculateProbabilities(currentCard, remainingCards);
    
    // With a 7, there should be more higher cards than lower
    expect(probabilities.higher).toBeGreaterThan(probabilities.lower);
    expect(probabilities.higher + probabilities.lower + probabilities.same).toBeCloseTo(1, 3);
  });

  it('should handle edge cases (Ace high, 2 low)', () => {
    const aceCard = { suit: 'Spades', rank: 'Ace' };
    const remainingCards = generateTestDeck();
    
    const probabilities = calculateProbabilities(aceCard, remainingCards);
    
    // Ace is highest, so higher probability should be 0
    expect(probabilities.higher).toBe(0);
    expect(probabilities.lower).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('EZ Mode Button Integration', () => {
  it('should show probabilities when EZ mode is enabled', () => {
    const { getByText } = render(
      <EZModeButton
        action="higher"
        probability={0.67}
        ezMode={true}
        displayMode="percentage"
        onClick={() => {}}
      />
    );
    
    expect(getByText('67%')).toBeInTheDocument();
  });

  it('should hide probabilities when EZ mode is disabled', () => {
    const { queryByText } = render(
      <EZModeButton
        action="higher"
        probability={0.67}
        ezMode={false}
        displayMode="percentage"
        onClick={() => {}}
      />
    );
    
    expect(queryByText('67%')).not.toBeInTheDocument();
  });
});
```

## Development Phases

### Phase 1: Basic Implementation
- [ ] Add probability calculations to game state
- [ ] Implement basic EZ mode toggle
- [ ] Show simple percentages on buttons

### Phase 2: Enhanced Display
- [ ] Add multiple display modes (percentage, detailed, color-coded)
- [ ] Implement confidence-based color coding
- [ ] Add settings panel for EZ mode configuration

### Phase 3: Educational Features
- [ ] Add tutorial for EZ mode
- [ ] Implement probability explanation panel
- [ ] Add keyboard shortcuts and accessibility features

### Phase 4: Advanced Features
- [ ] Performance optimization with memoization
- [ ] Advanced statistical displays
- [ ] Integration with card counting panel

## Success Metrics

### User Engagement
- **EZ Mode Adoption Rate**: % of users who enable EZ mode
- **Learning Progression**: Improvement in win rate with EZ mode
- **Feature Stickiness**: Users who keep EZ mode enabled across sessions

### Educational Impact
- **Understanding Improvement**: User comprehension of probability concepts
- **Decision Quality**: Better strategic choices with probability information
- **Confidence Building**: Reduced hesitation in making moves

### Technical Performance
- **Calculation Speed**: < 10ms for probability updates
- **UI Responsiveness**: No lag in button interactions
- **Memory Efficiency**: Minimal impact on overall app performance
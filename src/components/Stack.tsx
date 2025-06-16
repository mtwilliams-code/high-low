import type { FunctionComponent } from "react";
import type { Stack } from "../types/GameState";
import { makeMove } from "../store/gameState";
import BackCardComponent from "./BackCard";
import CardComponent from "./Card";
import CardPile from "./CardPile";
import EZModeButton from "./EZModeButton";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { calculateStackProbabilities } from "../utils/probabilityCalculations";
import { useStore } from "@nanostores/react";
import { $gameState } from "../store/gameState";

interface StackComponentProps extends Stack {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
  selected?: boolean;
  onSelect?: (row: number, column: number) => void;
  isMobile?: boolean;
  useTouchInterface?: boolean;
  onAnimatedMove?: (action: 'high' | 'low' | 'same', row: 1 | 2 | 3, column: 1 | 2 | 3) => void;
}

const StackComponent: FunctionComponent<StackComponentProps> = ({
  cards,
  status,
  row,
  column,
  selected = false,
  onSelect,
  isMobile = false,
  useTouchInterface = false,
  onAnimatedMove,
}) => {
  // ALL HOOKS MUST BE CALLED AT THE TOP IN THE SAME ORDER EVERY TIME
  const gameState = useStore($gameState);
  const { lightImpact } = useHapticFeedback();
  
  // Calculate probabilities for this stack if EZ Mode is enabled
  const probabilities = gameState.ezMode.enabled && status === "active" 
    ? calculateStackProbabilities(gameState.stacks, row, column, gameState.drawDeck.length)
    : null;

  // Early returns are OK after all hooks are called
  if (cards.length === 0) {
    const emptyStackClass = isMobile ? 'w-16 h-22' : 'w-20 h-28';
    return (
      <div className={`
        bg-gray-200 border border-gray-400 rounded
        ${emptyStackClass}
      `} />
    );
  }

  const topCard = cards[cards.length - 1];

  const handleGuess = (guess: "high" | "low" | "same") => {
    if (status === "active") {
      if (onAnimatedMove) {
        onAnimatedMove(guess, row, column);
      } else {
        makeMove({
          stackRow: row,
          stackColumn: column,
          highLowSame: guess,
          card: topCard,
        });
      }
    }
  };

  const handleStackClick = () => {
    if (status === "active" && onSelect && useTouchInterface) {
      lightImpact();
      onSelect(row, column);
    }
  };

  if (status === "failed") {
    return (
      <CardPile count={cards.length} size={isMobile ? 'medium' : 'large'}>
        <BackCardComponent size={isMobile ? 'medium' : 'large'} />
      </CardPile>
    );
  }

  return (
    <CardPile count={cards.length} size={isMobile ? 'medium' : 'large'}>
      <div className={`
        relative 
        ${useTouchInterface ? 'group-touch' : 'group'}
        ${selected ? 'ring-4 ring-blue-500 bg-blue-50' : ''}
        transition-all duration-200
        ${useTouchInterface && status === "active" ? 'active:scale-95 cursor-pointer' : ''}
      `}>
        <CardComponent 
          {...topCard} 
          size={isMobile ? 'medium' : 'large'}
          touchOptimized={useTouchInterface}
          selected={selected}
        />
        
        {/* Desktop/non-touch hover buttons overlay */}
        <div className={`absolute inset-0 transition-opacity duration-200 z-10 flex-col rounded-md overflow-clip ${useTouchInterface ? 'hidden' : 'hidden group-hover:flex'}`}>
          {/* Higher button - top third */}
          <button
            onClick={() => handleGuess("high")}
            className={`
              flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
              text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150
              ${gameState.ezMode.enabled && gameState.ezMode.colorByConfidence && probabilities
                ? (() => {
                    const confidence = probabilities.higher >= 0.6 ? 'high' : 
                                     probabilities.higher >= 0.35 ? 'medium' : 
                                     probabilities.higher >= 0.2 ? 'low' : 'very-low';
                    return confidence === 'high' ? 'bg-green-600/70' :
                           confidence === 'medium' ? 'bg-amber-500/70' :
                           confidence === 'low' ? 'bg-red-500/70' : 'bg-gray-500/70';
                  })()
                : 'bg-green-500/70'
              }
            `}
          >
            <span>Higher</span>
            {gameState.ezMode.enabled && probabilities && (
              <span className="text-xs opacity-90">
                {Math.round(probabilities.higher * 100)}%
              </span>
            )}
          </button>

          {/* Same button - middle third */}
          <button
            onClick={() => handleGuess("same")}
            className={`
              flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
              text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150
              ${gameState.ezMode.enabled && gameState.ezMode.colorByConfidence && probabilities
                ? (() => {
                    const confidence = probabilities.same >= 0.6 ? 'high' : 
                                     probabilities.same >= 0.35 ? 'medium' : 
                                     probabilities.same >= 0.2 ? 'low' : 'very-low';
                    return confidence === 'high' ? 'bg-green-600/70' :
                           confidence === 'medium' ? 'bg-amber-500/70' :
                           confidence === 'low' ? 'bg-red-500/70' : 'bg-gray-500/70';
                  })()
                : 'bg-yellow-500/70'
              }
            `}
          >
            <span>Same</span>
            {gameState.ezMode.enabled && probabilities && (
              <span className="text-xs opacity-90">
                {Math.round(probabilities.same * 100)}%
              </span>
            )}
          </button>

          {/* Lower button - bottom third */}
          <button
            onClick={() => handleGuess("low")}
            className={`
              flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
              text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150
              ${gameState.ezMode.enabled && gameState.ezMode.colorByConfidence && probabilities
                ? (() => {
                    const confidence = probabilities.lower >= 0.6 ? 'high' : 
                                     probabilities.lower >= 0.35 ? 'medium' : 
                                     probabilities.lower >= 0.2 ? 'low' : 'very-low';
                    return confidence === 'high' ? 'bg-green-600/70' :
                           confidence === 'medium' ? 'bg-amber-500/70' :
                           confidence === 'low' ? 'bg-red-500/70' : 'bg-gray-500/70';
                  })()
                : 'bg-red-500/70'
              }
            `}
          >
            <span>Lower</span>
            {gameState.ezMode.enabled && probabilities && (
              <span className="text-xs opacity-90">
                {Math.round(probabilities.lower * 100)}%
              </span>
            )}
          </button>
        </div>

        {/* Touch device tap target */}
        {useTouchInterface && status === "active" && (
          <button
            className="absolute inset-0 w-full h-full bg-transparent"
            onClick={handleStackClick}
            aria-label={`Select stack ${row},${column}`}
          />
        )}
      </div>
    </CardPile>
  );
};

export default StackComponent;
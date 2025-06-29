import type { FunctionComponent } from "react";
import type { Stack } from "../types/GameState";
import { makeMove } from "../store/gameState";
import BackCardComponent from "./BackCard";
import CardComponent from "./Card";
import CardPile from "./CardPile";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import DesktopStackControls from "./DesktopStackControls";

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
  const { lightImpact } = useHapticFeedback();

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
      <CardPile 
        count={cards.length} 
        size={isMobile ? 'medium' : 'large'}
        data-testid="stack"
        data-status={status}
        data-row={row}
        data-column={column}
      >
        <BackCardComponent size={isMobile ? 'medium' : 'large'} />
      </CardPile>
    );
  }

  return (
    <CardPile 
      count={cards.length} 
      size={isMobile ? 'medium' : 'large'}
      data-testid="stack"
      data-status={status}
      data-row={row}
      data-column={column}
    >
      <div 
        className={`
          relative 
          ${useTouchInterface ? 'group-touch' : 'group'}
          ${selected ? 'ring-4 ring-blue-500 bg-blue-50' : ''}
          transition-all duration-200
          ${useTouchInterface && status === "active" ? 'active:scale-95 cursor-pointer' : ''}
        `}
      >
        <CardComponent 
          {...topCard} 
          size={isMobile ? 'medium' : 'large'}
          touchOptimized={useTouchInterface}
          selected={selected}
        />
        
        {/* Desktop/non-touch hover buttons overlay */}
        <div className={`absolute inset-0 transition-opacity duration-200 z-10 flex-col rounded-md overflow-clip ${useTouchInterface ? 'hidden' : 'hidden group-hover:flex'}`}>
          <DesktopStackControls
            stackRow={row}
            stackColumn={column}
            isActive={status === "active"}
            onGuess={handleGuess}
            size={isMobile ? 'small' : 'medium'}
          />
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
import type { FunctionComponent, RefObject } from "react";
import { useStore } from "@nanostores/react";
import { makeMove, peekMove, makeMoveImmediate, $gameState } from "../store/gameState";
import { queueCardAnimation, getElementRect, $isAnimating } from "../store/animationManager";
import type { PlayerMove } from "../types/GameState";
import type { Card } from "../types/CardTypes";

interface AnimatedMoveManagerProps {
  deckRef: RefObject<HTMLDivElement | null>;
  stackRefs: RefObject<(HTMLDivElement | null)[][]>;
  children: (handleAnimatedMove: (action: 'high' | 'low' | 'same', stackRow: 1 | 2 | 3, stackColumn: 1 | 2 | 3) => void) => React.ReactNode;
}

const AnimatedMoveManager: FunctionComponent<AnimatedMoveManagerProps> = ({
  deckRef,
  stackRefs,
  children
}) => {
  const isAnimating = useStore($isAnimating);
  const gameState = useStore($gameState);

  const handleAnimatedMove = async (action: 'high' | 'low' | 'same', stackRow: 1 | 2 | 3, stackColumn: 1 | 2 | 3) => {
    if (isAnimating) return;
    
    // Get the current top card from the stack
    const stack = gameState.stacks[stackRow - 1][stackColumn - 1];
    if (stack.cards.length === 0 || stack.status === "failed") return;
    
    const topCard = stack.cards[stack.cards.length - 1];
    
    const move: PlayerMove = {
      stackRow,
      stackColumn,
      highLowSame: action,
      card: topCard
    };

    try {
      // Peek at the move to get the card and result
      const { drawnCard, wouldBeCorrect } = peekMove(move);
      
      // Get element positions
      const deckElement = deckRef.current;
      const stackElement = stackRefs.current?.[stackRow - 1]?.[stackColumn - 1];
      
      // Get rects for animation
      const fromRect = getElementRect(deckElement);
      const toRect = getElementRect(stackElement);
      
      if (!fromRect || !toRect) {
        // Fallback to immediate move if we can't get positions
        makeMove(move);
        return;
      }
      
      // Queue the animation
      queueCardAnimation({
        type: 'card-move',
        card: drawnCard,
        fromRect,
        toRect,
        targetRow: stackRow,
        targetColumn: stackColumn,
        wasCorrectGuess: wouldBeCorrect,
        duration: 400, // This will be overridden by animation manager
        onComplete: () => {
          // Apply the move after animation completes
          makeMoveImmediate(move);
        }
      });
      
    } catch (error) {
      console.error('Error during animated move:', error);
      // Fallback to immediate move
      try {
        makeMove(move);
      } catch (moveError) {
        console.error('Fallback move also failed:', moveError);
      }
    }
  };

  return <>{children(handleAnimatedMove)}</>;
};

export default AnimatedMoveManager;
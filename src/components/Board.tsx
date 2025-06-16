import { useStore } from "@nanostores/react";
import { useState, useRef, useEffect } from "react";
import { $gameState, startNewGame, makeMove, peekMove, startCardAnimation, endCardAnimation, makeMoveImmediate, toggleEZMode, toggleCardCounting, toggleCardCountingPanel } from "../store/gameState";
import StacksComponent from "./Stacks";
import CardPile from "./CardPile";
import BackCardComponent from "./BackCard";
import MobileActionPanel from "./MobileActionPanel";
import FlyingCard from "./FlyingCard";
import CardCountingPanel from "./CardCountingPanel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

interface StackPosition {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

const BoardComponent = () => {
  const state = useStore($gameState);
  const deviceInfo = useDeviceDetection();
  const [selectedStack, setSelectedStack] = useState<StackPosition | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const stackRefs = useRef<(HTMLDivElement | null)[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  // Use touch-based interactions for touch devices OR small screens on any device
  const useTouchInterface = deviceInfo.isTouchDevice || deviceInfo.isMobile;

  // Initialize game on mount to avoid hydration issues
  useEffect(() => {
    if (state.drawDeck.length === 0) {
      startNewGame();
    }
  }, [state.drawDeck.length]);

  const handleStackSelect = (row: number, column: number) => {
    const stackPosition: StackPosition = { row: row as 1 | 2 | 3, column: column as 1 | 2 | 3 };
    setSelectedStack(stackPosition);
  };

  const handleAnimatedMove = async (action: 'high' | 'low' | 'same', stackRow: 1 | 2 | 3, stackColumn: 1 | 2 | 3) => {
    if (state.animation.isAnimating) return;
    
    const stack = state.stacks[stackRow - 1][stackColumn - 1];
    if (stack.cards.length === 0 || stack.status === "failed") return;
    
    const topCard = stack.cards[stack.cards.length - 1];
    const move = {
      stackRow,
      stackColumn,
      highLowSame: action,
      card: topCard,
    };
    
    try {
      // Peek at the move to get the card and result
      const { drawnCard, wouldBeCorrect } = peekMove(move);
      
      // Get element positions
      const deckElement = deckRef.current;
      const stackElement = stackRefs.current[stackRow - 1][stackColumn - 1];
      
      if (!deckElement || !stackElement) {
        // Fallback to immediate move if we can't get positions
        makeMove(move);
        return;
      }
      
      // Get element positions for animation (positions are used in FlyingCard component)
      const deckRect = deckElement.getBoundingClientRect();
      const stackRect = stackElement.getBoundingClientRect();
      
      // Start animation
      startCardAnimation(drawnCard, stackRow, stackColumn, wouldBeCorrect);
      
      // Wait for pause + animation to complete before applying move
      const pauseDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 800;
      const animationDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 400;
      const totalDuration = pauseDuration + animationDuration + 50; // Extra 50ms buffer
      
      setTimeout(() => {
        makeMoveImmediate(move);
        endCardAnimation();
      }, totalDuration);
      
    } catch (error) {
      console.error("Error in animated move:", error);
      makeMove(move); // Fallback to immediate move
    }
  };

  const handleMobileAction = (action: 'high' | 'low' | 'same') => {
    if (selectedStack) {
      handleAnimatedMove(action, selectedStack.row, selectedStack.column);
    }
  };

  // Get the selected card for the mobile panel
  const selectedCard = selectedStack ? (() => {
    const stack = state.stacks[selectedStack.row - 1][selectedStack.column - 1];
    return stack.cards.length > 0 ? stack.cards[stack.cards.length - 1] : null;
  })() : null;

  const closeMobilePanel = () => {
    setSelectedStack(null);
  };

  return (
    <div className={`
      flex flex-col items-center bg-gray-100 min-h-screen game-element
      ${deviceInfo.isMobile 
        ? 'py-6 px-4 safe-area-top safe-area-bottom gap-y-6' 
        : 'justify-center h-screen gap-y-4'
      }
    `}>
      {/* Header Controls */}
      <div id="controls-space" className={`
        ${deviceInfo.isMobile ? 'w-full flex flex-col items-center gap-3 mt-2' : 'flex flex-col items-center gap-2'}
      `}>
        <button
          className={`
            bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors
            ${deviceInfo.isMobile ? 'px-6 py-3 text-lg font-semibold' : 'px-4 py-2'}
          `}
          onClick={startNewGame}
        >
          {deviceInfo.isMobile ? 'New Game' : 'Start New Game'}
        </button>
        
        {/* Quick Settings */}
        <div className={`flex gap-2 ${deviceInfo.isMobile ? 'flex-col' : 'flex-row'}`}>
          <button
            onClick={toggleEZMode}
            className={`
              px-3 py-1 text-sm rounded transition-colors
              ${state.ezMode.enabled 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            EZ Mode {state.ezMode.enabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              if (state.cardCounting.enabled) {
                toggleCardCountingPanel();
              } else {
                toggleCardCounting();
              }
            }}
            className={`
              px-3 py-1 text-sm rounded transition-colors
              ${state.cardCounting.enabled 
                ? (state.cardCounting.panelOpen 
                   ? 'bg-purple-600 text-white hover:bg-purple-700' 
                   : 'bg-purple-500 text-white hover:bg-purple-600')
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {state.cardCounting.enabled 
              ? (state.cardCounting.panelOpen ? 'Hide Stats' : 'Show Stats')
              : 'Card Count OFF'
            }
          </button>
        </div>
      </div>
      
      {/* Deck Display */}
      <div id="deck-space" className={`
        flex flex-col items-center
        ${deviceInfo.isMobile ? 'gap-3' : 'gap-2'}
      `}>
        <div ref={deckRef}>
          <CardPile 
            count={state.drawDeck.length} 
            size={deviceInfo.isMobile ? 'medium' : 'large'}
          >
            <BackCardComponent size={deviceInfo.isMobile ? 'medium' : 'large'} />
          </CardPile>
        </div>
        <p className={`
          text-gray-600 font-medium text-center
          ${deviceInfo.isMobile ? 'text-base' : 'text-sm'}
        `}>
          Deck: {state.drawDeck.length} cards
        </p>
      </div>
      
      {/* Game Stacks */}
      <div id="stacks-space" className={`
        ${deviceInfo.isMobile 
          ? 'flex-1 flex flex-col items-center justify-start pt-2 pb-4' 
          : ''
        }
      `}>
        <StacksComponent 
          stacks={state.stacks} 
          selectedStack={selectedStack}
          onStackSelect={handleStackSelect}
          isMobile={deviceInfo.isMobile}
          useTouchInterface={useTouchInterface}
          stackRefs={stackRefs}
          onAnimatedMove={handleAnimatedMove}
        />
      </div>
      
      {/* Game Status Messages */}
      {(state.won || state.lost) && (
        <div className={`
          ${deviceInfo.isMobile ? 'mt-4 mb-20' : 'mt-0'}
        `}>
          {state.won && (
            <div className={`
              text-green-600 font-bold text-center
              ${deviceInfo.isMobile ? 'text-2xl px-4' : 'text-xl'}
            `}>
              🎉 You Won! 🎉
            </div>
          )}
          
          {state.lost && (
            <div className={`
              text-red-600 font-bold text-center
              ${deviceInfo.isMobile ? 'text-2xl px-4' : 'text-xl'}
            `}>
              💀 Game Over! 💀
            </div>
          )}
        </div>
      )}

      {/* Flying Card Animation */}
      {state.animation.isAnimating && state.animation.flyingCard && state.animation.targetPosition && (
        (() => {
          const deckElement = deckRef.current;
          const targetRow = state.animation.targetPosition.row;
          const targetColumn = state.animation.targetPosition.column;
          const stackElement = stackRefs.current[targetRow - 1][targetColumn - 1];
          
          if (deckElement && stackElement) {
            const deckRect = deckElement.getBoundingClientRect();
            const stackRect = stackElement.getBoundingClientRect();
            
            return (
              <FlyingCard
                card={state.animation.flyingCard}
                fromRect={deckRect}
                toRect={stackRect}
                onAnimationComplete={() => {
                  // Animation completion is handled by the timeout in handleAnimatedMove
                }}
                wasCorrectGuess={state.animation.wasCorrectGuess}
                size={deviceInfo.isMobile ? 'medium' : 'large'}
              />
            );
          }
          return null;
        })()
      )}

      {/* Touch Action Panel - render for all touch devices */}
      {useTouchInterface && (
        <MobileActionPanel
          selectedStack={selectedStack}
          selectedCard={selectedCard}
          onAction={handleMobileAction}
          onClose={closeMobilePanel}
        />
      )}

      {/* Card Counting Panel */}
      <CardCountingPanel />
    </div>
  );
};

export default BoardComponent;

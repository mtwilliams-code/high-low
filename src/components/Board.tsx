import { useStore } from "@nanostores/react";
import { useRef, useEffect } from "react";
import { $gameState, startNewGame } from "../store/gameState";
import { $uiState, toggleEZMode, toggleCardCounting, toggleCardCountingPanel, setSelectedStack, clearSelectedStack, type StackPosition } from "../store/uiState";
import StacksComponent from "./Stacks";
import CardPile from "./CardPile";
import BackCardComponent from "./BackCard";
import MobileActionPanel from "./MobileActionPanel";
import FlyingCard from "./FlyingCard";
import CardCountingPanel from "./CardCountingPanel";
import AnimatedMoveManager from "./AnimatedMoveManager";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

const BoardComponent = () => {
  const gameState = useStore($gameState);
  const uiState = useStore($uiState);
  const deviceInfo = useDeviceDetection();
  const deckRef = useRef<HTMLDivElement>(null);
  const stackRefs = useRef<(HTMLDivElement | null)[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  // Use touch-based interactions for touch devices OR small screens on any device
  const useTouchInterface = deviceInfo.isTouchDevice || deviceInfo.isMobile;

  const handleStackSelect = (row: number, column: number) => {
    const stackPosition: StackPosition = { row: row as 1 | 2 | 3, column: column as 1 | 2 | 3 };
    setSelectedStack(stackPosition);
  };

  const handleMobileAction = (handleAnimatedMove: (action: 'high' | 'low' | 'same', stackRow: 1 | 2 | 3, stackColumn: 1 | 2 | 3) => void) => 
    (action: 'high' | 'low' | 'same') => {
      if (uiState.selectedStack) {
        handleAnimatedMove(action, uiState.selectedStack.row, uiState.selectedStack.column);
      }
    };

  // Get the selected card for the mobile panel
  const selectedCard = uiState.selectedStack ? (() => {
    const stack = gameState.stacks[uiState.selectedStack.row - 1][uiState.selectedStack.column - 1];
    return stack.cards.length > 0 ? stack.cards[stack.cards.length - 1] : null;
  })() : null;

  const closeMobilePanel = () => {
    clearSelectedStack();
  };

  // Expose game state to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__gameState = $gameState;
      (window as any).__uiState = $uiState;
    }
  }, []);

  return (
    <div 
      data-testid="game-board"
      className={`
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
              ${uiState.ezMode.enabled 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            EZ Mode {uiState.ezMode.enabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              if (uiState.cardCounting.enabled) {
                toggleCardCountingPanel();
              } else {
                toggleCardCounting();
              }
            }}
            className={`
              px-3 py-1 text-sm rounded transition-colors
              ${uiState.cardCounting.enabled 
                ? (uiState.cardCounting.panelOpen 
                   ? 'bg-purple-600 text-white hover:bg-purple-700' 
                   : 'bg-purple-500 text-white hover:bg-purple-600')
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {uiState.cardCounting.enabled 
              ? (uiState.cardCounting.panelOpen ? 'Hide Stats' : 'Show Stats')
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
        <div ref={deckRef} data-testid="deck">
          <CardPile 
            count={gameState.drawDeck.length} 
            size={deviceInfo.isMobile ? 'medium' : 'large'}
          >
            <BackCardComponent size={deviceInfo.isMobile ? 'medium' : 'large'} />
          </CardPile>
        </div>
        <p 
          data-testid="deck-count"
          className={`
            text-gray-600 font-medium text-center
            ${deviceInfo.isMobile ? 'text-base' : 'text-sm'}
          `}
        >
          Deck: {gameState.drawDeck.length} cards
        </p>
      </div>
      
      {/* Game Stacks */}
      <AnimatedMoveManager deckRef={deckRef} stackRefs={stackRefs}>
        {(handleAnimatedMove) => (
          <div id="stacks-space" className={`
            ${deviceInfo.isMobile 
              ? 'flex-1 flex flex-col items-center justify-start pt-2 pb-4' 
              : ''
            }
          `}>
            <StacksComponent 
              stacks={gameState.stacks} 
              selectedStack={uiState.selectedStack}
              onStackSelect={handleStackSelect}
              isMobile={deviceInfo.isMobile}
              useTouchInterface={useTouchInterface}
              stackRefs={stackRefs}
              onAnimatedMove={handleAnimatedMove}
            />
          </div>
        )}
      </AnimatedMoveManager>
      
      {/* Game Status Messages */}
      {(gameState.won || gameState.lost) && (
        <div className={`
          ${deviceInfo.isMobile ? 'mt-4 mb-20' : 'mt-0'}
        `}>
          {gameState.won && (
            <div 
              data-testid="win-message"
              className={`
                text-green-600 font-bold text-center
                ${deviceInfo.isMobile ? 'text-2xl px-4' : 'text-xl'}
              `}
            >
              🎉 You Won! 🎉
            </div>
          )}
          
          {gameState.lost && (
            <div 
              data-testid="lose-message"
              className={`
                text-red-600 font-bold text-center
                ${deviceInfo.isMobile ? 'text-2xl px-4' : 'text-xl'}
              `}
            >
              💀 Game Over! 💀
            </div>
          )}
        </div>
      )}

      {/* Flying Card Animation */}
      {uiState.animation.isAnimating && uiState.animation.flyingCard && uiState.animation.targetPosition && (
        (() => {
          const deckElement = deckRef.current;
          const targetRow = uiState.animation.targetPosition.row;
          const targetColumn = uiState.animation.targetPosition.column;
          const stackElement = stackRefs.current[targetRow - 1][targetColumn - 1];
          
          if (deckElement && stackElement) {
            const deckRect = deckElement.getBoundingClientRect();
            const stackRect = stackElement.getBoundingClientRect();
            
            return (
              <FlyingCard
                card={uiState.animation.flyingCard}
                fromRect={deckRect}
                toRect={stackRect}
                onAnimationComplete={() => {
                  // Animation completion is handled by the timeout in handleAnimatedMove
                }}
                wasCorrectGuess={uiState.animation.wasCorrectGuess}
                size={deviceInfo.isMobile ? 'medium' : 'large'}
              />
            );
          }
          return null;
        })()
      )}

      {/* Touch Action Panel - render for all touch devices */}
      {useTouchInterface && (
        <AnimatedMoveManager deckRef={deckRef} stackRefs={stackRefs}>
          {(handleAnimatedMove) => (
            <MobileActionPanel
              selectedStack={uiState.selectedStack}
              selectedCard={selectedCard}
              onAction={handleMobileAction(handleAnimatedMove)}
              onClose={closeMobilePanel}
            />
          )}
        </AnimatedMoveManager>
      )}

      {/* Card Counting Panel */}
      <CardCountingPanel />
    </div>
  );
};

export default BoardComponent;

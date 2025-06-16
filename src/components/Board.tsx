import { useStore } from "@nanostores/react";
import { useState } from "react";
import { $gameState, startNewGame, makeMove } from "../store/gameState";
import StacksComponent from "./Stacks";
import CardPile from "./CardPile";
import BackCardComponent from "./BackCard";
import MobileActionPanel from "./MobileActionPanel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

interface StackPosition {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

const BoardComponent = () => {
  const state = useStore($gameState);
  const deviceInfo = useDeviceDetection();
  const [selectedStack, setSelectedStack] = useState<StackPosition | null>(null);

  // Use touch-based interactions for all touch devices (mobile + tablets)
  const useTouchInterface = deviceInfo.isTouchDevice;

  const handleStackSelect = (row: number, column: number) => {
    const stackPosition: StackPosition = { row: row as 1 | 2 | 3, column: column as 1 | 2 | 3 };
    setSelectedStack(stackPosition);
  };

  const handleMobileAction = (action: 'high' | 'low' | 'same') => {
    if (selectedStack) {
      const stack = state.stacks[selectedStack.row - 1][selectedStack.column - 1];
      if (stack.cards.length > 0) {
        const topCard = stack.cards[stack.cards.length - 1];
        makeMove({
          stackRow: selectedStack.row,
          stackColumn: selectedStack.column,
          highLowSame: action,
          card: topCard,
        });
      }
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
        ${deviceInfo.isMobile ? 'w-full flex justify-center mt-2' : ''}
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
      </div>
      
      {/* Deck Display */}
      <div id="deck-space" className={`
        flex flex-col items-center
        ${deviceInfo.isMobile ? 'gap-3' : 'gap-2'}
      `}>
        <CardPile 
          count={state.drawDeck.length} 
          size={deviceInfo.isMobile ? 'medium' : 'large'}
        >
          <BackCardComponent size={deviceInfo.isMobile ? 'medium' : 'large'} />
        </CardPile>
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

      {/* Touch Action Panel - render for all touch devices */}
      {useTouchInterface && (
        <MobileActionPanel
          selectedStack={selectedStack}
          selectedCard={selectedCard}
          onAction={handleMobileAction}
          onClose={closeMobilePanel}
        />
      )}
    </div>
  );
};

export default BoardComponent;

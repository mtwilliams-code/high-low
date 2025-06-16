import type { FunctionComponent } from "react";
import { useStore } from "@nanostores/react";
import { $gameState } from "../store/gameState";
import { $uiState, type StackPosition } from "../store/uiState";
import { calculateStackProbabilities } from "../utils/probabilityCalculations";
import EZModeButton from "./EZModeButton";

interface MobileActionPanelProps {
  selectedStack: StackPosition | null;
  selectedCard: { suit: string; rank: string } | null;
  onAction: (action: 'high' | 'low' | 'same') => void;
  onClose: () => void;
}


const MobileActionPanel: FunctionComponent<MobileActionPanelProps> = ({ 
  selectedStack, 
  selectedCard,
  onAction, 
  onClose 
}) => {
  const isVisible = selectedStack && selectedCard;
  const gameState = useStore($gameState);
  const uiState = useStore($uiState);
  
  // Calculate probabilities for the selected stack
  const probabilities = selectedStack && uiState.ezMode.enabled
    ? calculateStackProbabilities(gameState.stacks, selectedStack.row, selectedStack.column, gameState.drawDeck.length)
    : null;

  const handleAction = (action: 'high' | 'low' | 'same') => {
    onAction(action);
    onClose();
  };

  return (
    <>
      {/* Invisible backdrop for tap-to-close functionality */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Action Panel - always rendered for smooth animation */}
      <div 
        data-testid="mobile-action-panel"
        className={`
          fixed bottom-0 left-0 right-0 
          bg-white/95 backdrop-blur-sm border-t border-gray-200 
          p-4 shadow-lg z-50 safe-area-bottom
          transform transition-all duration-500 ease-out
          ${isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}>
        {/* Always render content but show/hide with fallback values */}
        <>
          {/* Selected Card Display */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-16 flex items-center justify-center">
                {selectedCard && (
                  <playing-card 
                    suit={selectedCard.suit} 
                    rank={selectedCard.rank} 
                    className="w-12" 
                  />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {selectedCard ? `${selectedCard.rank} of ${selectedCard.suit}` : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedStack ? `Stack ${selectedStack.row},${selectedStack.column}` : ''}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Will the next card be:
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div data-testid="action-higher">
              <EZModeButton
                action="higher"
                probability={probabilities?.higher || 0}
                ezMode={uiState.ezMode.enabled}
                ezModeSettings={uiState.ezMode}
                onClick={() => handleAction('high')}
                size="large"
              />
            </div>
            <div data-testid="action-same">
              <EZModeButton
                action="same"
                probability={probabilities?.same || 0}
                ezMode={uiState.ezMode.enabled}
                ezModeSettings={uiState.ezMode}
                onClick={() => handleAction('same')}
                size="large"
              />
            </div>
            <div data-testid="action-lower">
              <EZModeButton
                action="lower"
                probability={probabilities?.lower || 0}
                ezMode={uiState.ezMode.enabled}
                ezModeSettings={uiState.ezMode}
                onClick={() => handleAction('low')}
                size="large"
              />
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="text-gray-500 text-sm px-4 py-2 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </>
      </div>
    </>
  );
};

export default MobileActionPanel;
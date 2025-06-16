import type { FunctionComponent } from "react";
import { useHapticFeedback } from "../hooks/useHapticFeedback";

interface StackPosition {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

interface MobileActionPanelProps {
  selectedStack: StackPosition | null;
  selectedCard: { suit: string; rank: string } | null;
  onAction: (action: 'high' | 'low' | 'same') => void;
  onClose: () => void;
}

const ActionButton: FunctionComponent<{
  action: 'high' | 'low' | 'same';
  onClick: () => void;
}> = ({ action, onClick }) => {
  const { mediumImpact } = useHapticFeedback();
  
  const colors = {
    high: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    same: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    low: 'bg-red-500 hover:bg-red-600 active:bg-red-700'
  };

  const labels = {
    high: 'Higher',
    same: 'Same', 
    low: 'Lower'
  };

  const handleClick = () => {
    mediumImpact();
    onClick();
  };

  return (
    <button
      className={`
        ${colors[action]}
        text-white font-bold py-4 px-6 rounded-lg
        min-h-[60px] min-w-[100px]
        flex flex-col items-center justify-center
        transform transition-all duration-150
        active:scale-95
        shadow-lg
        touch-manipulation
      `}
      onClick={handleClick}
    >
      <span className="text-lg">{labels[action]}</span>
    </button>
  );
};

const MobileActionPanel: FunctionComponent<MobileActionPanelProps> = ({ 
  selectedStack, 
  selectedCard,
  onAction, 
  onClose 
}) => {
  const isVisible = selectedStack && selectedCard;

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
      <div className={`
        fixed bottom-0 left-0 right-0 
        bg-white/95 backdrop-blur-sm border-t border-gray-200 
        p-4 shadow-lg z-50 safe-area-bottom
        transform transition-all duration-300 ease-out
        ${isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
        }
      `}>
        {/* Only show content when we have valid data */}
        {isVisible && selectedCard && selectedStack && (
          <>
            {/* Selected Card Display */}
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-16 flex items-center justify-center">
                  <playing-card 
                    suit={selectedCard.suit} 
                    rank={selectedCard.rank} 
                    className="w-12" 
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {selectedCard.rank} of {selectedCard.suit}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Stack {selectedStack.row},{selectedStack.column}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Will the next card be:
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <ActionButton
                action="high"
                onClick={() => handleAction('high')}
              />
              <ActionButton
                action="same"
                onClick={() => handleAction('same')}
              />
              <ActionButton
                action="low"
                onClick={() => handleAction('low')}
              />
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
        )}
      </div>
    </>
  );
};

export default MobileActionPanel;
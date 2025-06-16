import type { FunctionComponent } from "react";
import { useStore } from "@nanostores/react";
import { $gameState } from "../store/gameState";
import { $uiState } from "../store/uiState";
import { calculateStackProbabilities } from "../utils/probabilityCalculations";

interface DesktopStackControlsProps {
  stackRow: 1 | 2 | 3;
  stackColumn: 1 | 2 | 3;
  isActive: boolean;
  onGuess: (guess: "high" | "low" | "same") => void;
  size?: 'small' | 'medium' | 'large';
}

const DesktopStackControls: FunctionComponent<DesktopStackControlsProps> = ({
  stackRow,
  stackColumn,
  isActive,
  onGuess,
  size = 'medium'
}) => {
  const gameState = useStore($gameState);
  const uiState = useStore($uiState);
  
  // Calculate probabilities for this stack if EZ Mode is enabled
  const probabilities = uiState.ezMode.enabled && isActive 
    ? calculateStackProbabilities(gameState.stacks, stackRow, stackColumn, gameState.drawDeck.length)
    : null;

  if (!isActive) {
    return null;
  }

  const sizeClasses = {
    small: 'text-xs py-1 px-2',
    medium: uiState.ezMode.enabled ? 'text-xs py-1 px-2' : 'text-xs py-2 px-3', 
    large: uiState.ezMode.enabled ? 'text-xs py-2 px-3' : 'text-sm py-3 px-4'
  };

  return (
    <>
      {/* Higher Button */}
      <button
        onClick={() => onGuess("high")}
        className={`
          flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
          text-white font-semibold backdrop-blur-sm transition-all duration-150
          ${sizeClasses[size]}
          ${uiState.ezMode.enabled && uiState.ezMode.colorByConfidence && probabilities
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
        <span className={uiState.ezMode.enabled ? "text-xs leading-tight" : ""}>Higher</span>
        {uiState.ezMode.enabled && probabilities && (
          <span className="text-xs opacity-90 leading-tight">
            {Math.round(probabilities.higher * 100)}%
          </span>
        )}
      </button>

      {/* Same Button */}
      <button
        onClick={() => onGuess("same")}
        className={`
          flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
          text-white font-semibold backdrop-blur-sm transition-all duration-150
          ${sizeClasses[size]}
          ${uiState.ezMode.enabled && uiState.ezMode.colorByConfidence && probabilities
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
        <span className={uiState.ezMode.enabled ? "text-xs leading-tight" : ""}>Same</span>
        {uiState.ezMode.enabled && probabilities && (
          <span className="text-xs opacity-90 leading-tight">
            {Math.round(probabilities.same * 100)}%
          </span>
        )}
      </button>

      {/* Lower Button */}
      <button
        onClick={() => onGuess("low")}
        className={`
          flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-30 hover:!opacity-90 
          text-white font-semibold backdrop-blur-sm transition-all duration-150
          ${sizeClasses[size]}
          ${uiState.ezMode.enabled && uiState.ezMode.colorByConfidence && probabilities
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
        <span className={uiState.ezMode.enabled ? "text-xs leading-tight" : ""}>Lower</span>
        {uiState.ezMode.enabled && probabilities && (
          <span className="text-xs opacity-90 leading-tight">
            {Math.round(probabilities.lower * 100)}%
          </span>
        )}
      </button>
    </>
  );
};

export default DesktopStackControls;
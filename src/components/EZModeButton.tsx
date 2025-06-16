import type { FunctionComponent } from "react";
import { formatProbability, getConfidenceLevel } from "../utils/probabilityCalculations";
import type { EZModeSettings } from "../store/uiState";

interface EZModeButtonProps {
  action: 'higher' | 'lower' | 'same';
  probability: number;
  ezMode: boolean;
  ezModeSettings: EZModeSettings;
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const EZModeButton: FunctionComponent<EZModeButtonProps> = ({
  action,
  probability,
  ezMode,
  ezModeSettings,
  onClick,
  disabled = false,
  size = 'medium'
}) => {
  const getDisplayContent = () => {
    if (!ezMode) {
      return {
        primary: action.charAt(0).toUpperCase() + action.slice(1),
        secondary: null
      };
    }

    const percentage = formatProbability(probability);
    const confidence = getConfidenceLevel(probability);

    switch (ezModeSettings.displayMode) {
      case 'percentage':
        return {
          primary: action.charAt(0).toUpperCase() + action.slice(1),
          secondary: percentage
        };

      case 'detailed':
        // Calculate fraction (requires remaining cards context)
        const totalRemaining = Math.round(probability * 100); // Simplified for now
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
      
      default:
        return {
          primary: action.charAt(0).toUpperCase() + action.slice(1),
          secondary: null
        };
    }
  };

  const { primary, secondary } = getDisplayContent();
  const confidence = ezMode ? getConfidenceLevel(probability) : null;

  const baseColors = {
    higher: 'bg-green-500/70 hover:bg-green-600/70',
    same: 'bg-yellow-500/70 hover:bg-yellow-600/70',
    lower: 'bg-red-500/70 hover:bg-red-600/70'
  };

  const confidenceColors = {
    'high': 'bg-green-600/70 hover:bg-green-700/70',
    'medium': 'bg-amber-500/70 hover:bg-amber-600/70',
    'low': 'bg-red-500/70 hover:bg-red-600/70',
    'very-low': 'bg-gray-500/70 hover:bg-gray-600/70'
  };

  const buttonColor = ezMode && confidence && ezModeSettings.colorByConfidence
    ? confidenceColors[confidence] 
    : baseColors[action];

  const sizeClasses = {
    small: 'text-xs py-1 px-2 min-h-[40px] min-w-[60px]',
    medium: 'text-xs py-2 px-3 min-h-[50px] min-w-[80px]',
    large: 'text-sm py-3 px-4 min-h-[60px] min-w-[100px]'
  };

  return (
    <button
      className={`
        ${buttonColor}
        text-white font-semibold rounded
        ${sizeClasses[size]}
        flex flex-col items-center justify-center
        transform transition-all duration-150
        active:scale-95
        backdrop-blur-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        border border-white/20
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${primary}${secondary ? `, ${secondary} probability` : ''}`}
    >
      <span className={ezMode && secondary ? 'text-sm leading-tight' : 'text-base'}>
        {primary}
      </span>
      {secondary && ezMode && (
        <span className="text-xs opacity-90 mt-0.5 leading-tight">
          {secondary}
        </span>
      )}
    </button>
  );
};

export default EZModeButton;
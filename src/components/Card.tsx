import type { FunctionComponent } from "react";
import type { Card } from "../types/CardTypes";

interface CardComponentProps extends Card {
  size?: 'small' | 'medium' | 'large';
  touchOptimized?: boolean;
  selected?: boolean;
}

const CardComponent: FunctionComponent<CardComponentProps> = ({ 
  suit, 
  rank, 
  size = 'large',
  touchOptimized = false,
  selected = false 
}) => {
  const cardSizes = {
    small: 'w-12 h-16',    // 48x64px - mobile compact
    medium: 'w-16 h-22',   // 64x88px - mobile standard  
    large: 'w-20 h-28'     // 80x112px - desktop standard
  };

  const cardSizeClasses = {
    small: 'w-12',
    medium: 'w-16', 
    large: 'w-20'
  };

  return (
    <div className={`
      ${cardSizes[size]}
      ${selected ? 'ring-4 ring-blue-500' : ''}
      ${touchOptimized ? 'transform transition-transform active:scale-95' : ''}
    `}>
      <playing-card 
        suit={suit} 
        rank={rank} 
        className={cardSizeClasses[size]} 
      />
    </div>
  );
};

export default CardComponent;

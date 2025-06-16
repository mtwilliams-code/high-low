import type { FunctionComponent, ReactNode } from "react";

interface CardPileProps {
  count: number;
  children: ReactNode;
}

const CardPile: FunctionComponent<CardPileProps> = ({ count, children }) => {
  // Always reserve space for the maximum offset to prevent layout shifts
  const maxPossibleOffset = 6; // 3 cards * 2px each

  return (
    <div className="relative" style={{ width: '86px', height: '118px' }}>
      {/* Container with fixed dimensions: 80px (card) + 6px (max offset) */}
      <div className="absolute inset-0">
        {/* Background cards to create depth effect - only show if count > 1 */}
        {count > 1 && Array.from({ length: Math.min(count - 1, 3) }, (_, i) => (
          <div
            key={i}
            className="absolute w-20 h-28 bg-white border border-gray-300 rounded-lg shadow-sm"
            style={{
              top: `${(i + 1) * 2}px`,
              left: `${(i + 1) * 2}px`,
              zIndex: 3 - i, // Reverse z-index: furthest card has lowest z-index
            }}
          />
        ))}
        
        {/* Main card content - always in the same position */}
        <div className="absolute top-0 left-0" style={{ zIndex: 4 }}>
          {children}
        </div>
        
        {/* Card count badge - only show if count > 1 */}
        {count > 1 && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg" style={{ zIndex: 20 }}>
            {count}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPile;
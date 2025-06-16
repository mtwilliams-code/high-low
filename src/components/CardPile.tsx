import type { FunctionComponent, ReactNode } from "react";

interface CardPileProps {
  count: number;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  'data-testid'?: string;
  'data-status'?: string;
  'data-row'?: number;
  'data-column'?: number;
}

const CardPile: FunctionComponent<CardPileProps> = ({ 
  count, 
  children, 
  size = 'large',
  'data-testid': dataTestId,
  'data-status': dataStatus,
  'data-row': dataRow,
  'data-column': dataColumn
}) => {
  // Responsive dimensions based on card size
  const dimensions = {
    small: { width: '54px', height: '70px', cardClass: 'w-12 h-16' },      // 48px + 6px offset
    medium: { width: '70px', height: '94px', cardClass: 'w-16 h-22' },     // 64px + 6px offset  
    large: { width: '86px', height: '118px', cardClass: 'w-20 h-28' }      // 80px + 6px offset
  };

  const { width, height, cardClass } = dimensions[size];

  return (
    <div 
      className="relative" 
      style={{ width, height }}
      data-testid={dataTestId}
      data-status={dataStatus}
      data-row={dataRow}
      data-column={dataColumn}
    >
      {/* Container with responsive dimensions */}
      <div className="absolute inset-0">
        {/* Background cards to create depth effect - only show if count > 1 */}
        {count > 1 && Array.from({ length: Math.min(count - 1, 3) }, (_, i) => (
          <div
            key={i}
            className={`absolute ${cardClass} bg-white border border-gray-300 rounded-lg shadow-sm`}
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
          <div className={`
            absolute -top-2 -right-2 bg-blue-600 text-white font-bold rounded-full 
            flex items-center justify-center shadow-lg
            ${size === 'small' ? 'w-4 h-4 text-xs' : 'w-6 h-6 text-xs'}
          `} style={{ zIndex: 20 }}>
            {count}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPile;
import type { FunctionComponent } from "react";
import { useStore } from "@nanostores/react";
import { $gameState, toggleCardCountingPanel, toggleCardCounting } from "../store/gameState";
import { getAllRanks, formatProbability, getCardCounts } from "../utils/probabilityCalculations";
import type { CardCount, ProbabilityCalculation } from "../types/GameState";

interface CardCountingPanelProps {
  className?: string;
}

const RankDistributionChart: FunctionComponent<{
  cardCounts: CardCount[];
  highlightRank?: string;
}> = ({ cardCounts, highlightRank }) => {
  return (
    <div className="space-y-1">
      {cardCounts.map((count) => {
        const percentage = count.remaining / 4;
        const isHighlighted = highlightRank === count.rank;
        
        return (
          <div
            key={count.rank}
            className={`flex items-center justify-between text-sm ${
              isHighlighted ? 'bg-blue-100 px-2 py-1 rounded' : ''
            }`}
          >
            <span className="font-medium w-8">{count.rank}:</span>
            <div className="flex items-center flex-1 mx-3">
              {/* Visual bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage === 1 ? 'bg-green-500' :
                    percentage >= 0.75 ? 'bg-blue-500' :
                    percentage >= 0.5 ? 'bg-yellow-500' :
                    percentage > 0 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-12 text-right">
                ({count.remaining}/4)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProbabilityDisplay: FunctionComponent<{
  probabilities: ProbabilityCalculation | null;
  compact?: boolean;
}> = ({ probabilities, compact = false }) => {
  if (!probabilities) {
    return (
      <div className="text-center text-gray-500 py-4">
        Select a stack to see probabilities
      </div>
    );
  }

  const textSize = compact ? 'text-sm' : 'text-base';
  const spacing = compact ? 'space-y-1' : 'space-y-2';

  const getConfidenceColor = (prob: number) => {
    if (prob >= 0.6) return 'text-green-600';
    if (prob >= 0.35) return 'text-yellow-600';
    if (prob >= 0.2) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`${spacing}`}>
      <div className={`flex justify-between ${textSize}`}>
        <span>Higher:</span>
        <span className={`font-semibold ${getConfidenceColor(probabilities.higher)}`}>
          {formatProbability(probabilities.higher)} ({Math.round(probabilities.higher * probabilities.total)}/{probabilities.total})
        </span>
      </div>
      <div className={`flex justify-between ${textSize}`}>
        <span>Same:</span>
        <span className={`font-semibold ${getConfidenceColor(probabilities.same)}`}>
          {formatProbability(probabilities.same)} ({Math.round(probabilities.same * probabilities.total)}/{probabilities.total})
        </span>
      </div>
      <div className={`flex justify-between ${textSize}`}>
        <span>Lower:</span>
        <span className={`font-semibold ${getConfidenceColor(probabilities.lower)}`}>
          {formatProbability(probabilities.lower)} ({Math.round(probabilities.lower * probabilities.total)}/{probabilities.total})
        </span>
      </div>
    </div>
  );
};

const CardCountingPanel: FunctionComponent<CardCountingPanelProps> = ({ 
  className = ""
}) => {
  const gameState = useStore($gameState);
  const { cardCounting } = gameState;
  
  // Calculate card counts dynamically from current seen cards for real-time updates
  const currentCardCounts = getCardCounts(cardCounting.seenCards);

  // Calculate current probabilities based on remaining cards in deck
  const currentProbabilities = (() => {
    if (gameState.drawDeck.length === 0) return null;
    
    // For display purposes, show general probabilities based on deck composition
    const totalRemaining = gameState.drawDeck.length;
    const ranks = getAllRanks();
    
    // Count remaining cards by rank value
    let higher = 0;
    let lower = 0;
    let same = 0;
    
    // Assume we're comparing against a middle card (7) for general display
    const baseRankValue = 7;
    
    currentCardCounts.forEach(count => {
      const rankValue = ranks.indexOf(count.rank) + 2; // Convert to 2-14 scale
      if (rankValue > baseRankValue) {
        higher += count.remaining;
      } else if (rankValue < baseRankValue) {
        lower += count.remaining;
      } else {
        same += count.remaining;
      }
    });
    
    return {
      higher: totalRemaining > 0 ? higher / totalRemaining : 0,
      lower: totalRemaining > 0 ? lower / totalRemaining : 0,
      same: totalRemaining > 0 ? same / totalRemaining : 0,
      total: totalRemaining
    };
  })();

  if (!cardCounting.enabled) {
    return null;
  }

  return (
    <div className={`
      fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-sm 
      border-l border-gray-200 shadow-lg z-40
      transform transition-transform duration-300 ease-out
      ${cardCounting.panelOpen ? 'translate-x-0' : 'translate-x-full'}
      ${className}
    `}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Card Statistics</h2>
          <button
            onClick={toggleCardCountingPanel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Deck Status */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Deck Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Cards remaining:</span>
                <span className="font-semibold">{gameState.drawDeck.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cards seen:</span>
                <span className="font-semibold">{cardCounting.seenCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total cards:</span>
                <span className="font-semibold">52</span>
              </div>
            </div>
          </div>

          {/* Remaining Cards by Rank */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Remaining Cards by Rank</h3>
            <RankDistributionChart 
              cardCounts={currentCardCounts}
            />
          </div>

          {/* Current Odds */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Current Odds</h3>
            <ProbabilityDisplay 
              probabilities={currentProbabilities}
              compact={false}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentCardCounts.filter(c => c.remaining === 4).length}
                </div>
                <div className="text-xs text-gray-600">Complete ranks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {currentCardCounts.filter(c => c.remaining === 0).length}
                </div>
                <div className="text-xs text-gray-600">Exhausted ranks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <button
            onClick={() => {
              toggleCardCounting();
              toggleCardCountingPanel();
            }}
            className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
          >
            Turn Off Card Counting
          </button>
          <div className="text-xs text-gray-500 text-center">
            Card counting helps you make informed decisions
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCountingPanel;
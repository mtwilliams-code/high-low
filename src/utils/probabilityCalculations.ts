import type { Card, CardRank } from "../types/CardTypes";
import type { ProbabilityCalculation, CardCount, Stacks } from "../types/GameState";

// Map card ranks to numerical values for comparison
export function getRankValue(rank: CardRank): number {
  switch (rank) {
    case "2": return 2;
    case "3": return 3;
    case "4": return 4;
    case "5": return 5;
    case "6": return 6;
    case "7": return 7;
    case "8": return 8;
    case "9": return 9;
    case "10": return 10;
    case "Jack": return 11;
    case "Queen": return 12;
    case "King": return 13;
    case "Ace": return 14;
  }
}

// Get all ranks in order
export function getAllRanks(): CardRank[] {
  return ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
}

// Generate a full 52-card deck
export function generateFullDeck(): Card[] {
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"] as const;
  const ranks = getAllRanks();
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return deck;
}

// Get all visible cards from stacks (including cards underneath)
export function getAllVisibleCards(stacks: Stacks): Card[] {
  const visibleCards: Card[] = [];
  
  stacks.forEach(row => {
    row.forEach(stack => {
      // Add all cards in each stack (not just top card)
      visibleCards.push(...stack.cards);
    });
  });
  
  return visibleCards;
}

// Get remaining cards in deck based on seen cards
export function getRemainingCards(seenCards: Card[]): Card[] {
  const fullDeck = generateFullDeck();
  
  // Remove seen cards
  const remaining = fullDeck.filter(card => {
    return !seenCards.some(seenCard => 
      seenCard.suit === card.suit && seenCard.rank === card.rank
    );
  });
  
  return remaining;
}

// Calculate card counts for each rank
export function getCardCounts(seenCards: Card[]): CardCount[] {
  const ranks = getAllRanks();
  const cardCounts: CardCount[] = [];
  
  for (const rank of ranks) {
    const total = 4; // 4 cards of each rank in a deck
    const seen = seenCards.filter(card => card.rank === rank).length;
    const remaining = total - seen;
    
    cardCounts.push({
      rank,
      total,
      seen,
      remaining
    });
  }
  
  return cardCounts;
}

// Calculate probabilities for Higher/Lower/Same outcomes
export function calculateProbabilities(currentCard: Card, remainingCards: Card[]): ProbabilityCalculation {
  const currentRank = getRankValue(currentCard.rank);
  
  let higher = 0;
  let lower = 0;
  let same = 0;
  
  remainingCards.forEach(card => {
    const cardRank = getRankValue(card.rank);
    if (cardRank > currentRank) higher++;
    else if (cardRank < currentRank) lower++;
    else same++;
  });
  
  const total = remainingCards.length;
  
  return {
    higher: total > 0 ? higher / total : 0,
    lower: total > 0 ? lower / total : 0,
    same: total > 0 ? same / total : 0,
    total
  };
}

// Get confidence level based on probability
export function getConfidenceLevel(probability: number): 'high' | 'medium' | 'low' | 'very-low' {
  if (probability >= 0.6) return 'high';
  if (probability >= 0.35) return 'medium';
  if (probability >= 0.2) return 'low';
  return 'very-low';
}

// Format probability as percentage string
export function formatProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

// Calculate probabilities for a specific stack's top card
export function calculateStackProbabilities(stacks: Stacks, stackRow: number, stackColumn: number, drawDeckLength: number): ProbabilityCalculation | null {
  const stack = stacks[stackRow - 1][stackColumn - 1];
  
  if (stack.cards.length === 0 || stack.status === "failed") {
    return null;
  }
  
  const topCard = stack.cards[stack.cards.length - 1];
  const allVisibleCards = getAllVisibleCards(stacks);
  const remainingCards = getRemainingCards(allVisibleCards);
  
  return calculateProbabilities(topCard, remainingCards);
}
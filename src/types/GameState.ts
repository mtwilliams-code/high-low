import type { Card, CardRank } from "./CardTypes";

export type Stack = { cards: Card[]; status: "active" | "failed" };

export type Stacks = [
  [Stack, Stack, Stack],
  [Stack, Stack, Stack],
  [Stack, Stack, Stack],
];

export interface CardCount {
  rank: CardRank;
  remaining: number;
  total: number;
  seen: number;
}

export interface ProbabilityCalculation {
  higher: number;    // Probability as decimal (0-1)
  lower: number;
  same: number;
  total: number;     // Total cards remaining
}

export interface CardCountingData {
  seenCards: Card[];        // All cards that have been played
  cardCounts: CardCount[];
  probabilities: ProbabilityCalculation | null;
}

export type GameState = {
  drawDeck: Card[];
  stacks: Stacks;
  won: boolean;
  lost: boolean;
  cardCounting: CardCountingData;
};

export type PlayerMove = {
  stackRow: 1 | 2 | 3;
  stackColumn: 1 | 2 | 3;
  highLowSame: "high" | "low" | "same";
  card: Card;
};

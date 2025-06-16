import type { Card } from "./CardTypes";

export type Stack = { cards: Card[]; status: "active" | "failed" };

export type Stacks = [
  [Stack, Stack, Stack],
  [Stack, Stack, Stack],
  [Stack, Stack, Stack],
];

export type GameState = {
  drawDeck: Card[];
  stacks: Stacks;
  won: boolean;
  lost: boolean;
  animation: {
    isAnimating: boolean;
    flyingCard: Card | null;
    targetPosition: { row: number; column: number } | null;
    wasCorrectGuess: boolean;
  };
};

export type PlayerMove = {
  stackRow: 1 | 2 | 3;
  stackColumn: 1 | 2 | 3;
  highLowSame: "high" | "low" | "same";
  card: Card;
};

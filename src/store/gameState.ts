// store/users.ts
import { atom } from "nanostores";
import type { Card } from "../types/CardTypes";
import type { GameState, PlayerMove, Stacks, CardCountingData } from "../types/GameState";
import { getAllVisibleCards, getCardCounts } from "../utils/probabilityCalculations";

class OutOfCardsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutOfCardsError";
  }
}

class InvalidMoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMoveError";
  }
}

const shuffleDeck = (deck: Card[]) => {
  let array = [...deck];
  // The modern version of the Fisher-Yates shuffle algorithm
  // https://bost.ocks.org/mike/shuffle/
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const drawCard = (deck: Card[]) => {
  if (deck.length === 0) {
    throw new OutOfCardsError("No more cards in the deck");
  }
  return deck.pop() as Card;
};

const rawDeck: Card[] = (
  ["Hearts", "Diamonds", "Clubs", "Spades"] as const
).flatMap((suit) =>
  (
    [
      "Ace",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "Jack",
      "Queen",
      "King",
    ] as const
  ).map((rank) => ({ suit, rank })),
);

const initialCardCountingData: CardCountingData = {
  seenCards: [],
  cardCounts: getCardCounts([]),
  probabilities: null
};

export const $gameState = atom<GameState>({
  drawDeck: [], // Start with empty deck to avoid hydration mismatch
  stacks: [
    [
      { cards: [], status: "active" },
      { cards: [], status: "active" },
      { cards: [], status: "active" },
    ],
    [
      { cards: [], status: "active" },
      { cards: [], status: "active" },
      { cards: [], status: "active" },
    ],
    [
      { cards: [], status: "active" },
      { cards: [], status: "active" },
      { cards: [], status: "active" },
    ],
  ],
  won: false,
  lost: false,
  cardCounting: initialCardCountingData,
});

/**
 * Compares the ranks of two cards.
 * Returns 1 if card1 is higher, -1 if card2 is higher, and 0 if they are equal.
 * @param card1 the first card to compare
 * @param card2 the second card to compare
 * @returns  number indicating the comparison result
 */
const compareRanks = (card1: Card, card2: Card): number => {
  const rankOrder: Record<Card["rank"], number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    Jack: 11,
    Queen: 12,
    King: 13,
    Ace: 14,
  };
  const rank1 = rankOrder[card1.rank];
  const rank2 = rankOrder[card2.rank];
  if (rank1 > rank2) {
    return 1; // card1 is higher
  }
  if (rank1 < rank2) {
    return -1; // card2 is higher
  }
  return 0; // cards are equal
};

const initializeDeckAndStacks: () => {
  drawDeck: Card[];
  stacks: Stacks;
} = () => {
  const deck = shuffleDeck([...rawDeck]);
  const stacks: Stacks = [
    [
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
    ],
    [
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
    ],
    [
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
      { cards: [drawCard(deck)], status: "active" },
    ],
  ];
  return {
    drawDeck: deck,
    stacks,
  };
};

export function startNewGame() {
  const { drawDeck, stacks } = initializeDeckAndStacks();
  
  // Reset card counting data with starting cards
  const resetCardCountingData: CardCountingData = {
    seenCards: getAllVisibleCards(stacks), // Initialize with starting cards
    cardCounts: getCardCounts(getAllVisibleCards(stacks)),
    probabilities: null
  };
  
  $gameState.set({ 
    drawDeck,
    stacks,
    won: false, 
    lost: false,
    cardCounting: resetCardCountingData
  });
}

/**
 * Peek at what card would be drawn without actually drawing it
 * @param move The player move to peek at
 * @returns The card that would be drawn and whether the guess would be correct
 */
export function peekMove(move: PlayerMove): { drawnCard: Card; wouldBeCorrect: boolean } {
  const currentState = $gameState.get();
  const { highLowSame, card } = move;
  
  if (currentState.drawDeck.length === 0) {
    throw new OutOfCardsError("No more cards in the deck");
  }
  
  const drawnCard = currentState.drawDeck[currentState.drawDeck.length - 1];
  const predictedResult = highLowSame === "high" ? 1 : highLowSame === "low" ? -1 : 0;
  const comparisonResult = compareRanks(drawnCard, card);
  const wouldBeCorrect = comparisonResult === predictedResult;
  
  return { drawnCard, wouldBeCorrect };
}


/**
 * Make move without animation - for direct state updates after animation
 */
export function makeMoveImmediate(move: PlayerMove) {
  makeMove(move);
}



export function makeMove(move: PlayerMove) {
  const currentState = $gameState.get();
  const { stackRow, stackColumn, highLowSame, card } = move;
  const predictedResult =
    highLowSame === "high" ? 1 : highLowSame === "low" ? -1 : 0;

  // Check if the selected stack is failed
  const selectedStack = currentState.stacks[stackRow - 1][stackColumn - 1];
  if (selectedStack.status === "failed") {
    throw new InvalidMoveError(
      `Cannot play on failed stack at position [${stackRow},${stackColumn}]`,
    );
  }

  try {
    const drawnCard = drawCard(currentState.drawDeck);
    const comparisonResult = compareRanks(drawnCard, card);

    // wrong guess - put the card on the stack and mark it as failed
    if (comparisonResult !== predictedResult) {
      const updatedStack = {
        cards: [
          ...currentState.stacks[stackRow - 1][stackColumn - 1].cards,
          drawnCard,
        ] as Card[],
        status: "failed",
      } as const;

      const updatedStacks: Stacks = [...currentState.stacks];
      updatedStacks[stackRow - 1][stackColumn - 1] = updatedStack;

      // Update card tracking
      const newSeenCards = [...currentState.cardCounting.seenCards, drawnCard];

      // Check if the game is lost
      // If all stacks are failed, the game is lost
      const stillPlaying = updatedStacks.some((row) =>
        row.some((stack) => stack.status === "active"),
      );
      if (!stillPlaying) {
        console.log("You lost!");
      }

      $gameState.set({
        ...currentState,
        stacks: updatedStacks,
        won: currentState.won,
        lost: !stillPlaying,
        cardCounting: {
          seenCards: newSeenCards,
          cardCounts: getCardCounts(newSeenCards),
          probabilities: null
        }
      });
    }
    // correct guess - add the card to the stack and keep it active
    else {
      // Add the drawn card to the specified stack
      const updatedStack = {
        cards: [
          ...currentState.stacks[stackRow - 1][stackColumn - 1].cards,
          drawnCard,
        ] as Card[],
        status: currentState.stacks[stackRow - 1][stackColumn - 1].status,
      } as const;
      const updatedStacks: Stacks = [...currentState.stacks];
      updatedStacks[stackRow - 1][stackColumn - 1] = updatedStack;

      // Update card tracking
      const newSeenCards = [...currentState.cardCounting.seenCards, drawnCard];

      // Check if the game is won
      const won = currentState.drawDeck.length === 0;
      if (won) {
        console.log("You Win! All stacks are empty.");
      }

      $gameState.set({
        ...currentState,
        drawDeck: currentState.drawDeck,
        stacks: updatedStacks,
        won,
        lost: currentState.lost,
        cardCounting: {
          seenCards: newSeenCards,
          cardCounts: getCardCounts(newSeenCards),
          probabilities: null
        }
      });
    }
  } catch (e) {
    if (e instanceof OutOfCardsError) {
      console.log("You Win! No more cards left in the deck.");
      return;
    }
    console.error("Error drawing card:", e);
    return;
  }
}

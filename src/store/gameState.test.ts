import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Card, CardRank, CardSuit } from "../types/CardTypes";
import type { PlayerMove } from "../types/GameState";
import { $gameState, makeMove, startNewGame } from "./gameState";

describe("High-Low Game Logic", () => {
  beforeEach(() => {
    // Reset the game state before each test
    startNewGame();
  });

  describe("Game Initialization", () => {
    it("should initialize with 9 active stacks", () => {
      const state = $gameState.get();

      expect(state.stacks).toHaveLength(3);
      state.stacks.forEach((row) => {
        expect(row).toHaveLength(3);
        row.forEach((stack) => {
          expect(stack.status).toBe("active");
          expect(stack.cards).toHaveLength(1);
        });
      });
    });

    it("should have 43 cards remaining in deck after dealing", () => {
      const state = $gameState.get();
      // 52 cards total - 9 cards dealt to stacks = 43
      expect(state.drawDeck).toHaveLength(43);
    });

    it("should start with won and lost as false", () => {
      const state = $gameState.get();
      expect(state.won).toBe(false);
      expect(state.lost).toBe(false);
    });
  });

  describe("Correct Guesses", () => {
    it('should handle correct "higher" guess', () => {
      const state = $gameState.get();

      // Find a stack with a low card
      const lowCard: Card = {
        suit: "Hearts" as CardSuit,
        rank: "2" as CardRank,
      };
      state.stacks[0][0] = { cards: [lowCard], status: "active" };

      // Ensure next card is higher (manually set for testing)
      const higherCard: Card = {
        suit: "Diamonds" as CardSuit,
        rank: "King" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = higherCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: lowCard,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[0][0].cards).toHaveLength(2);
      expect(newState.stacks[0][0].status).toBe("active");
      expect(newState.stacks[0][0].cards[1]).toEqual(higherCard);
    });

    it('should handle correct "lower" guess', () => {
      const state = $gameState.get();

      // Set up a high card on the stack
      const highCard: Card = {
        suit: "Spades" as CardSuit,
        rank: "Ace" as CardRank,
      };
      state.stacks[1][1] = { cards: [highCard], status: "active" };

      // Ensure next card is lower
      const lowerCard: Card = {
        suit: "Clubs" as CardSuit,
        rank: "3" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = lowerCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 2,
        stackColumn: 2,
        highLowSame: "low",
        card: highCard,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[1][1].cards).toHaveLength(2);
      expect(newState.stacks[1][1].status).toBe("active");
    });

    it('should handle correct "same" guess', () => {
      const state = $gameState.get();

      // Set up a card on the stack
      const card: Card = { suit: "Hearts" as CardSuit, rank: "7" as CardRank };
      state.stacks[2][2] = { cards: [card], status: "active" };

      // Ensure next card has same rank
      const sameCard: Card = {
        suit: "Diamonds" as CardSuit,
        rank: "7" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = sameCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 3,
        stackColumn: 3,
        highLowSame: "same",
        card: card,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[2][2].cards).toHaveLength(2);
      expect(newState.stacks[2][2].status).toBe("active");
    });
  });

  describe("Incorrect Guesses", () => {
    it('should fail stack on incorrect "higher" guess', () => {
      const state = $gameState.get();

      // Set up a high card on the stack
      const highCard: Card = {
        suit: "Hearts" as CardSuit,
        rank: "King" as CardRank,
      };
      state.stacks[0][0] = { cards: [highCard], status: "active" };

      // Ensure next card is lower (wrong guess)
      const lowerCard: Card = {
        suit: "Diamonds" as CardSuit,
        rank: "2" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = lowerCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: highCard,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[0][0].cards).toHaveLength(2);
      expect(newState.stacks[0][0].status).toBe("failed");
    });

    it('should fail stack on incorrect "lower" guess', () => {
      const state = $gameState.get();

      // Set up a low card on the stack
      const lowCard: Card = {
        suit: "Clubs" as CardSuit,
        rank: "3" as CardRank,
      };
      state.stacks[1][1] = { cards: [lowCard], status: "active" };

      // Ensure next card is higher (wrong guess)
      const higherCard: Card = {
        suit: "Spades" as CardSuit,
        rank: "Queen" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = higherCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 2,
        stackColumn: 2,
        highLowSame: "low",
        card: lowCard,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[1][1].status).toBe("failed");
    });

    it('should fail stack on incorrect "same" guess', () => {
      const state = $gameState.get();

      // Set up a card on the stack
      const card: Card = { suit: "Hearts" as CardSuit, rank: "7" as CardRank };
      state.stacks[2][2] = { cards: [card], status: "active" };

      // Ensure next card has different rank
      const differentCard: Card = {
        suit: "Diamonds" as CardSuit,
        rank: "8" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = differentCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 3,
        stackColumn: 3,
        highLowSame: "same",
        card: card,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[2][2].status).toBe("failed");
    });
  });

  describe("Win Condition", () => {
    it("should win when deck is empty after correct guess", () => {
      const state = $gameState.get();

      // Set up game with only one card left in deck
      const lastCard: Card = {
        suit: "Hearts" as CardSuit,
        rank: "5" as CardRank,
      };
      state.drawDeck = [lastCard];

      const stackCard: Card = {
        suit: "Diamonds" as CardSuit,
        rank: "3" as CardRank,
      };
      state.stacks[0][0] = { cards: [stackCard], status: "active" };

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: stackCard,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.won).toBe(true);
      expect(newState.drawDeck).toHaveLength(0);
    });

    it("should handle out of cards error gracefully", () => {
      const state = $gameState.get();

      // Empty the deck
      state.drawDeck = [];
      const card: Card = { suit: "Hearts" as CardSuit, rank: "5" as CardRank };
      state.stacks[0][0] = { cards: [card], status: "active" };

      $gameState.set(state);

      const consoleSpy = vi.spyOn(console, "log");

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: card,
      };

      // Should not throw, but handle gracefully
      expect(() => makeMove(move)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "You Win! No more cards left in the deck.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Lose Condition", () => {
    it("should lose when all stacks are failed", () => {
      const state = $gameState.get();

      // Set all stacks except one as failed
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (row !== 0 || col !== 0) {
            state.stacks[row][col].status = "failed";
          }
        }
      }

      // Set up last active stack for failure
      const card: Card = {
        suit: "Hearts" as CardSuit,
        rank: "King" as CardRank,
      };
      state.stacks[0][0] = { cards: [card], status: "active" };

      // Ensure wrong guess
      const lowerCard: Card = {
        suit: "Clubs" as CardSuit,
        rank: "2" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = lowerCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: card,
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.lost).toBe(true);
      expect(
        newState.stacks.every((row) =>
          row.every((stack) => stack.status === "failed"),
        ),
      ).toBe(true);
    });
  });

  describe("Invalid Move on Failed Stack", () => {
    it("should throw error when trying to play on failed stack", () => {
      const state = $gameState.get();

      // Set a stack as failed
      const card: Card = { suit: "Hearts" as CardSuit, rank: "7" as CardRank };
      state.stacks[0][0] = { cards: [card], status: "failed" };

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: card,
      };

      expect(() => makeMove(move)).toThrow(
        "Cannot play on failed stack at position [1,1]",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple cards on a stack correctly", () => {
      const state = $gameState.get();

      // Set up a stack with multiple cards
      const cards: Card[] = [
        { suit: "Hearts" as CardSuit, rank: "3" as CardRank },
        { suit: "Diamonds" as CardSuit, rank: "5" as CardRank },
        { suit: "Clubs" as CardSuit, rank: "7" as CardRank },
      ];
      state.stacks[0][0] = { cards, status: "active" };

      // Next card should be compared with the top card (7 of Clubs)
      const higherCard: Card = {
        suit: "Spades" as CardSuit,
        rank: "9" as CardRank,
      };
      state.drawDeck[state.drawDeck.length - 1] = higherCard;

      $gameState.set(state);

      const move: PlayerMove = {
        stackRow: 1,
        stackColumn: 1,
        highLowSame: "high",
        card: cards[2], // Top card
      };

      makeMove(move);

      const newState = $gameState.get();
      expect(newState.stacks[0][0].cards).toHaveLength(4);
      expect(newState.stacks[0][0].status).toBe("active");
    });
  });
});

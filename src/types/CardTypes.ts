export type CardSuit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Jack"
  | "Queen"
  | "King"
  | "Ace";

export type Card = {
  suit: CardSuit;
  rank: CardRank;
};

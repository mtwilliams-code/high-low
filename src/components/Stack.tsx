import type { FunctionComponent } from "react";
import type { Stack } from "../types/GameState";
import { makeMove } from "../store/gameState";
import BackCardComponent from "./BackCard";
import CardComponent from "./Card";
import CardPile from "./CardPile";

interface StackComponentProps extends Stack {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

const StackComponent: FunctionComponent<StackComponentProps> = ({
  cards,
  status,
  row,
  column,
}) => {
  if (cards.length === 0) {
    return (
      <div className="w-20 h-28 bg-gray-200 border border-gray-400 rounded" />
    );
  }

  const topCard = cards[cards.length - 1];

  const handleGuess = (guess: "high" | "low" | "same") => {
    if (status === "active") {
      makeMove({
        stackRow: row,
        stackColumn: column,
        highLowSame: guess,
        card: topCard,
      });
    }
  };

  if (status === "failed") {
    return (
      <CardPile count={cards.length}>
        <BackCardComponent />
      </CardPile>
    );
  }

  return (
    <CardPile count={cards.length}>
      <div className="relative group">
        <CardComponent {...topCard} />
        
        {/* Hover buttons overlay - divided into vertical thirds */}
        <div className="absolute inset-0 transition-opacity duration-200 z-10 hidden md:flex flex-col rounded-md overflow-clip">
          {/* Higher button - top third */}
          <button
            onClick={() => handleGuess("high")}
            className="flex-1 flex items-center opacity-0 group-hover:opacity-30 hover:!opacity-90 justify-center bg-green-500/70 text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150"
          >
            Higher
          </button>

          {/* Same button - middle third */}
          <button
            onClick={() => handleGuess("same")}
            className="flex-1 flex items-center opacity-0 group-hover:opacity-30 hover:!opacity-90 justify-center bg-yellow-500/70 text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150"
          >
            Same
          </button>

          {/* Lower button - bottom third */}
          <button
            onClick={() => handleGuess("low")}
            className="flex-1 flex items-center opacity-0 group-hover:opacity-30 hover:!opacity-90 justify-center bg-red-500/70 text-white text-xs font-semibold backdrop-blur-sm transition-all duration-150"
          >
            Lower
          </button>
        </div>
      </div>
    </CardPile>
  );
};

export default StackComponent;
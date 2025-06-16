import { useStore } from "@nanostores/react";
import { $gameState, startNewGame } from "../store/gameState";
import StacksComponent from "./Stacks";
import CardPile from "./CardPile";
import BackCardComponent from "./BackCard";

const BoardComponent = () => {
  const state = useStore($gameState);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-y-4">
      <div id="controls-space">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={startNewGame}
        >
          Start New Game
        </button>
      </div>
      
      <div id="deck-space" className="flex flex-col items-center gap-2">
        <CardPile count={state.drawDeck.length}>
          <BackCardComponent />
        </CardPile>
        <p className="text-sm text-gray-600 font-medium">
          Deck: {state.drawDeck.length} cards
        </p>
      </div>
      
      <div id="stacks-space">
        <StacksComponent stacks={state.stacks} />
      </div>
      
      {state.won && (
        <div className="text-green-600 font-bold text-xl">
          🎉 You Won! 🎉
        </div>
      )}
      
      {state.lost && (
        <div className="text-red-600 font-bold text-xl">
          💀 Game Over! 💀
        </div>
      )}
    </div>
  );
};

export default BoardComponent;

import type { FunctionComponent } from "react";
import type { Card } from "../types/CardTypes";

const CardComponent: FunctionComponent<Card> = ({ suit, rank }) => {
  return (
    <div className="w-20 h-28">
      <playing-card suit={suit} rank={rank} className="w-20" />
    </div>
  );
};

export default CardComponent;

import type { FunctionComponent } from "react";
import type { Stacks } from "../types/GameState";
import StackComponent from "./Stack";

const StacksComponent: FunctionComponent<{ stacks: Stacks }> = ({ stacks }) => {
  return (
    <div className="flex flex-col gap-4">
      {stacks.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.map((stack, colIndex) => (
            <StackComponent
              key={`${rowIndex}-${colIndex}`}
              {...stack}
              row={(rowIndex + 1) as 1 | 2 | 3}
              column={(colIndex + 1) as 1 | 2 | 3}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
export default StacksComponent;

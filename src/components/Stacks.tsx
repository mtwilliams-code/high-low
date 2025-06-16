import type { FunctionComponent } from "react";
import type { Stacks } from "../types/GameState";
import StackComponent from "./Stack";

interface StackPosition {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

interface StacksComponentProps {
  stacks: Stacks;
  selectedStack?: StackPosition | null;
  onStackSelect?: (row: number, column: number) => void;
  isMobile?: boolean;
  useTouchInterface?: boolean;
}

const StacksComponent: FunctionComponent<StacksComponentProps> = ({ 
  stacks, 
  selectedStack = null,
  onStackSelect,
  isMobile = false,
  useTouchInterface = false
}) => {
  return (
    <div className={`
      flex flex-col
      ${isMobile ? 'gap-3' : 'gap-4'}
    `}>
      {stacks.map((row, rowIndex) => (
        <div key={rowIndex} className={`
          flex justify-center
          ${isMobile ? 'gap-3' : 'gap-4'}
        `}>
          {row.map((stack, colIndex) => (
            <StackComponent
              key={`${rowIndex}-${colIndex}`}
              {...stack}
              row={(rowIndex + 1) as 1 | 2 | 3}
              column={(colIndex + 1) as 1 | 2 | 3}
              selected={
                selectedStack?.row === rowIndex + 1 && 
                selectedStack?.column === colIndex + 1
              }
              onSelect={onStackSelect}
              isMobile={isMobile}
              useTouchInterface={useTouchInterface}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
export default StacksComponent;

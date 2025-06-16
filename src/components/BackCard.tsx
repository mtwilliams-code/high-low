import type { FunctionComponent } from "react";

interface BackCardComponentProps {
  size?: "small" | "medium" | "large";
}

const BackCardComponent: FunctionComponent<BackCardComponentProps> = ({
  size = "large",
}) => {
  const cardSizes = {
    small: "w-12 h-16", // 48x64px
    medium: "w-16 h-22", // 64x88px
    large: "w-20 h-28", // 80x112px
  };

  const cardSizeClasses = {
    small: "w-12",
    medium: "w-16",
    large: "w-20",
  };

  return (
    <div className={cardSizes[size]}>
      <playing-card
        rank="0"
        suit="Diamonds"
        className={cardSizeClasses[size]}
      />
    </div>
  );
};
export default BackCardComponent;

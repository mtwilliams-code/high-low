import type { FunctionComponent } from "react";
import { useEffect, useState } from "react";
import type { Card } from "../types/CardTypes";
import CardComponent from "./Card";
import "../styles/animations.css";

interface FlyingCardProps {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
  onAnimationComplete: () => void;
  wasCorrectGuess: boolean;
}

const FlyingCard: FunctionComponent<FlyingCardProps> = ({
  card,
  fromRect,
  toRect,
  onAnimationComplete,
  wasCorrectGuess
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const deltaX = toRect.left - fromRect.left;
  const deltaY = toRect.top - fromRect.top;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animationDuration = prefersReducedMotion ? 50 : 400;

  useEffect(() => {
    // Show card at deck for a moment, then start animation
    const pauseDuration = prefersReducedMotion ? 100 : 800; // Longer pause for users to read the card
    
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, pauseDuration);
    
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div
      className="flying-card fixed pointer-events-none z-50"
      style={{
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
        transform: isAnimating ? `translate(${deltaX}px, ${deltaY}px)` : 'translate(0, 0)',
        transition: isAnimating ? `transform ${animationDuration}ms ease-out` : 'none',
        willChange: 'transform',
        opacity: 1 // Ensure full opacity
      }}
      onTransitionEnd={() => {
        // Small delay to ensure animation is visually complete
        setTimeout(onAnimationComplete, 50);
      }}
    >
      <div className={`
        relative w-full h-full
        ${wasCorrectGuess ? '' : 'failure-indicator'}
      `}>
        <div className="relative">
          <div className={`
            ${wasCorrectGuess ? '' : 'ring-4 ring-red-500 rounded-lg'}
            inline-block
          `}>
            <CardComponent 
              {...card} 
              size="large"
            />
          </div>
        </div>
        
        {/* Visual indicator for incorrect guesses */}
        {!wasCorrectGuess && (
          <div className="absolute inset-0 rounded-md flex items-center justify-center pointer-events-none">
            <span className="text-red-600 font-bold text-2xl drop-shadow-lg">✗</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlyingCard;
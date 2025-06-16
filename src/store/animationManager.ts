import { atom, computed } from "nanostores";
import type { Card } from "../types/CardTypes";
import { $uiState, startCardAnimation, endCardAnimation } from "./uiState";

export interface AnimationSequence {
  id: string;
  type: 'card-move';
  card: Card;
  fromRect: DOMRect | null;
  toRect: DOMRect | null;
  targetRow: number;
  targetColumn: number;
  wasCorrectGuess: boolean;
  duration: number;
  onComplete?: () => void;
}

// Animation queue
export const $animationQueue = atom<AnimationSequence[]>([]);

// Animation settings
export const $animationSettings = atom({
  prefersReducedMotion: false,
  pauseDuration: 800,
  animationDuration: 400,
  reducedPauseDuration: 100,
  reducedAnimationDuration: 50
});

// Computed animation durations based on motion preference
export const $animationTimings = computed([$animationSettings], (settings) => {
  const { prefersReducedMotion, pauseDuration, animationDuration, reducedPauseDuration, reducedAnimationDuration } = settings;
  
  return {
    pauseDuration: prefersReducedMotion ? reducedPauseDuration : pauseDuration,
    animationDuration: prefersReducedMotion ? reducedAnimationDuration : animationDuration,
    totalDuration: prefersReducedMotion ? 
      reducedPauseDuration + reducedAnimationDuration + 50 : 
      pauseDuration + animationDuration + 50
  };
});

// Initialize motion preference detection
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  // Set initial value
  $animationSettings.set({
    ...$animationSettings.get(),
    prefersReducedMotion: mediaQuery.matches
  });
  
  // Listen for changes
  mediaQuery.addEventListener('change', (e) => {
    $animationSettings.set({
      ...$animationSettings.get(),
      prefersReducedMotion: e.matches
    });
  });
}

// Animation queue management
export function queueCardAnimation(animation: Omit<AnimationSequence, 'id'>) {
  const id = `animation-${Date.now()}-${Math.random()}`;
  const sequence: AnimationSequence = {
    id,
    ...animation
  };
  
  const currentQueue = $animationQueue.get();
  $animationQueue.set([...currentQueue, sequence]);
  
  // If this is the only animation, start it immediately
  if (currentQueue.length === 0) {
    processNextAnimation();
  }
}

export function processNextAnimation() {
  const queue = $animationQueue.get();
  if (queue.length === 0) return;
  
  const [currentAnimation, ...remainingQueue] = queue;
  $animationQueue.set(remainingQueue);
  
  executeCardAnimation(currentAnimation);
}

function executeCardAnimation(animation: AnimationSequence) {
  if (!animation.fromRect || !animation.toRect) {
    // Skip animation if we don't have valid rects
    animation.onComplete?.();
    processNextAnimation();
    return;
  }
  
  // Start UI animation
  startCardAnimation(
    animation.card,
    animation.targetRow,
    animation.targetColumn,
    animation.wasCorrectGuess
  );
  
  const timings = $animationTimings.get();
  
  // Complete animation after total duration
  setTimeout(() => {
    endCardAnimation();
    animation.onComplete?.();
    processNextAnimation();
  }, timings.totalDuration);
}

// Helper function to get element rect safely
export function getElementRect(element: HTMLElement | null): DOMRect | null {
  if (!element) return null;
  
  try {
    return element.getBoundingClientRect();
  } catch {
    return null;
  }
}

// Clear animation queue (useful for game resets)
export function clearAnimationQueue() {
  $animationQueue.set([]);
  endCardAnimation();
}

// Animation state helpers
export const $isAnimating = computed([$uiState, $animationQueue], (uiState, queue) => {
  return uiState.animation.isAnimating || queue.length > 0;
});
import { atom } from "nanostores";
import type { Card } from "../types/CardTypes";

// UI-specific interfaces
export interface AnimationState {
  isAnimating: boolean;
  flyingCard: Card | null;
  targetPosition: { row: number; column: number } | null;
  wasCorrectGuess: boolean;
}

export interface EZModeSettings {
  enabled: boolean;
  displayMode: 'percentage' | 'detailed' | 'color-coded';
  colorByConfidence: boolean;
}

export interface CardCountingUIState {
  enabled: boolean;
  panelOpen: boolean;
}

export interface StackPosition {
  row: 1 | 2 | 3;
  column: 1 | 2 | 3;
}

export interface UIState {
  animation: AnimationState;
  ezMode: EZModeSettings;
  cardCounting: CardCountingUIState;
  selectedStack: StackPosition | null;
}

// Initial state
const initialAnimationState: AnimationState = {
  isAnimating: false,
  flyingCard: null,
  targetPosition: null,
  wasCorrectGuess: true
};

const initialEZModeSettings: EZModeSettings = {
  enabled: false,
  displayMode: 'percentage',
  colorByConfidence: true
};

const initialCardCountingUIState: CardCountingUIState = {
  enabled: false,
  panelOpen: false
};

export const $uiState = atom<UIState>({
  animation: initialAnimationState,
  ezMode: initialEZModeSettings,
  cardCounting: initialCardCountingUIState,
  selectedStack: null
});

// Animation actions
export function startCardAnimation(card: Card, targetRow: number, targetColumn: number, wasCorrectGuess: boolean) {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    animation: {
      isAnimating: true,
      flyingCard: card,
      targetPosition: { row: targetRow, column: targetColumn },
      wasCorrectGuess
    }
  });
}

export function endCardAnimation() {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    animation: {
      isAnimating: false,
      flyingCard: null,
      targetPosition: null,
      wasCorrectGuess: true
    }
  });
}

// EZ Mode actions
export function toggleEZMode() {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    ezMode: {
      ...currentState.ezMode,
      enabled: !currentState.ezMode.enabled
    }
  });
}

export function updateEZModeSettings(settings: Partial<EZModeSettings>) {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    ezMode: {
      ...currentState.ezMode,
      ...settings
    }
  });
}

// Card counting UI actions
export function toggleCardCounting() {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    cardCounting: {
      ...currentState.cardCounting,
      enabled: !currentState.cardCounting.enabled
    }
  });
}

export function toggleCardCountingPanel() {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    cardCounting: {
      ...currentState.cardCounting,
      panelOpen: !currentState.cardCounting.panelOpen
    }
  });
}

// Stack selection actions
export function setSelectedStack(stack: StackPosition | null) {
  const currentState = $uiState.get();
  $uiState.set({
    ...currentState,
    selectedStack: stack
  });
}

export function clearSelectedStack() {
  setSelectedStack(null);
}
import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const lightImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const mediumImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  }, []);

  const heavyImpact = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20]);
    }
  }, []);

  const errorFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }, []);

  const successFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 200]);
    }
  }, []);

  return { 
    lightImpact, 
    mediumImpact, 
    heavyImpact, 
    errorFeedback, 
    successFeedback 
  };
};
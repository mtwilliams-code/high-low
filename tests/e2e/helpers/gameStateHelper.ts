import { type Page } from "@playwright/test";
import type { GameState } from "../../../src/types/GameState";

/**
 * Helper class to interact with the game state in Playwright tests
 */
export class GameStateHelper {
  constructor(private page: Page) {}

  /**
   * Expose game state helper methods to the browser window for easy access in tests
   */
  async setupGameStateHelpers() {
    await this.page.addInitScript(() => {
      // Add helper methods to window for test manipulation
      (window as any).__testHelpers = {
        getGameState: () => {
          // Try to find the game state store
          const stores = [
            (window as any).__gameState,
            (globalThis as any).__gameState,
            (window as any).$gameState,
            (globalThis as any).$gameState,
          ];

          for (const store of stores) {
            if (store && typeof store.get === "function") {
              return store.get();
            }
          }

          // If direct access fails, try to find it through module system
          if ((window as any).__vite_modules) {
            for (const [key, module] of Object.entries(
              (window as any).__vite_modules,
            )) {
              if (key.includes("gameState") && (module as any)?.$gameState) {
                return (module as any).$gameState.get();
              }
            }
          }

          return null;
        },

        setGameState: (newState: any) => {
          // Try to find the game state store
          const stores = [
            (window as any).__gameState,
            (globalThis as any).__gameState,
            (window as any).$gameState,
            (globalThis as any).$gameState,
          ];

          for (const store of stores) {
            if (store && typeof store.set === "function") {
              store.set(newState);
              return true;
            }
          }

          // If direct access fails, try to find it through module system
          if ((window as any).__vite_modules) {
            for (const [key, module] of Object.entries(
              (window as any).__vite_modules,
            )) {
              if (key.includes("gameState") && (module as any)?.$gameState) {
                (module as any).$gameState.set(newState);
                return true;
              }
            }
          }

          return false;
        },

        setWinState: () => {
          const current = (window as any).__testHelpers.getGameState();
          if (current) {
            return (window as any).__testHelpers.setGameState({
              ...current,
              won: true,
              drawDeck: [],
            });
          }
          return false;
        },

        setLoseState: () => {
          const current = (window as any).__testHelpers.getGameState();
          if (current) {
            // Set all stacks to failed
            for (let row = 0; row < 3; row++) {
              for (let col = 0; col < 3; col++) {
                if (current.stacks[row] && current.stacks[row][col]) {
                  current.stacks[row][col].status = "failed";
                }
              }
            }

            return (window as any).__testHelpers.setGameState({
              ...current,
              lost: true,
            });
          }
          return false;
        },

        setStackFailed: (row: number, col: number) => {
          const current = (window as any).__testHelpers.getGameState();
          if (current && current.stacks[row] && current.stacks[row][col]) {
            // Create a deep copy to ensure state change is detected
            const newState = JSON.parse(JSON.stringify(current));
            newState.stacks[row][col].status = "failed";
            return (window as any).__testHelpers.setGameState(newState);
          }
          return false;
        },
      };
    });
  }

  /**
   * Get the current game state from the browser
   */
  async getGameState(): Promise<GameState | null> {
    return await this.page.evaluate(() => {
      return (window as any).__testHelpers?.getGameState() || null;
    });
  }

  /**
   * Set the game state in the browser
   */
  async setGameState(newState: Partial<GameState>) {
    return await this.page.evaluate((state) => {
      const current = (window as any).__testHelpers?.getGameState();
      if (current) {
        return (window as any).__testHelpers?.setGameState({
          ...current,
          ...state,
        });
      }
      return false;
    }, newState);
  }

  /**
   * Force a win state
   */
  async setWinState() {
    return await this.page.evaluate(() => {
      return (window as any).__testHelpers?.setWinState();
    });
  }

  /**
   * Force a lose state (all stacks failed)
   */
  async setLoseState() {
    return await this.page.evaluate(() => {
      return (window as any).__testHelpers?.setLoseState();
    });
  }

  /**
   * Set a specific stack to failed status
   */
  async setStackFailed(row: number, col: number) {
    return await this.page.evaluate(
      ({ row, col }) => {
        return (window as any).__testHelpers?.setStackFailed(row, col);
      },
      { row, col },
    );
  }

  /**
   * Wait for the game state to update and UI to reflect changes
   */
  async waitForStateUpdate(timeout = 1000) {
    await this.page.waitForTimeout(timeout);
  }
}

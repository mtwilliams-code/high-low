#!/usr/bin/env node

import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { $gameState, startNewGame, makeMove } from './src/store/gameState.ts';

const cardSymbols = {
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
  Spades: '♠'
};

const suitColors = {
  Hearts: chalk.red,
  Diamonds: chalk.red,
  Clubs: chalk.black,
  Spades: chalk.black
};

function displayCard(card) {
  const symbol = cardSymbols[card.suit];
  const color = suitColors[card.suit];
  return color(`${card.rank}${symbol}`);
}

function displayStack(stack, row, col) {
  const topCard = stack.cards[stack.cards.length - 1];
  const stackLabel = `[${row},${col}]`;
  
  if (!topCard) {
    return chalk.gray(`${stackLabel} Empty`);
  }
  
  const cardDisplay = displayCard(topCard);
  const count = stack.cards.length;
  const countDisplay = count > 1 ? chalk.gray(` (${count})`) : '';
  
  if (stack.status === 'failed') {
    return chalk.strikethrough.dim(`${stackLabel} ${cardDisplay}${countDisplay}`);
  }
  
  return `${stackLabel} ${cardDisplay}${countDisplay}`;
}

function displayGameState() {
  const state = $gameState.get();
  
  console.clear();
  console.log(chalk.bold.cyan('\n=== HIGH-LOW CARD GAME ===\n'));
  
  // Display deck count
  console.log(chalk.yellow(`Cards remaining in deck: ${state.drawDeck.length}\n`));
  
  // Display stacks grid
  console.log(chalk.bold('Game Board:'));
  for (let row = 0; row < 3; row++) {
    let rowDisplay = '';
    for (let col = 0; col < 3; col++) {
      const stack = state.stacks[row][col];
      rowDisplay += displayStack(stack, row + 1, col + 1) + '  ';
    }
    console.log(rowDisplay);
  }
  console.log('');
  
  // Display game status
  if (state.won) {
    console.log(chalk.green.bold('🎉 CONGRATULATIONS! YOU WON! 🎉'));
    return true;
  }
  
  if (state.lost) {
    console.log(chalk.red.bold('💀 GAME OVER! All stacks failed! 💀'));
    return true;
  }
  
  return false;
}

async function getPlayerMove() {
  const state = $gameState.get();
  
  // Get available stacks (not failed)
  const availableStacks = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (state.stacks[row][col].status === 'active') {
        const topCard = state.stacks[row][col].cards[state.stacks[row][col].cards.length - 1];
        availableStacks.push({
          name: `[${row + 1},${col + 1}] ${displayCard(topCard)}`,
          value: { row: row + 1, col: col + 1, card: topCard }
        });
      }
    }
  }
  
  if (availableStacks.length === 0) {
    return null;
  }
  
  const stack = await select({
    message: 'Choose a stack to play on:',
    choices: availableStacks
  });
  
  const prediction = await select({
    message: 'Will the next card be:',
    choices: [
      { name: 'Higher', value: 'high' },
      { name: 'Lower', value: 'low' },
      { name: 'Same', value: 'same' }
    ]
  });
  
  return {
    stackRow: stack.row,
    stackColumn: stack.col,
    highLowSame: prediction,
    card: stack.card
  };
}

async function playGame() {
  startNewGame();
  
  while (true) {
    const gameOver = displayGameState();
    if (gameOver) break;
    
    const move = await getPlayerMove();
    if (!move) break;
    
    makeMove(move);
  }
}

async function main() {
  console.log(chalk.bold.cyan('Welcome to High-Low Card Game!'));
  console.log(chalk.gray('Try to empty the deck by correctly guessing if the next card will be higher or lower.\n'));
  
  let playAgain = true;
  
  while (playAgain) {
    await playGame();
    
    playAgain = await confirm({
      message: 'Play again?',
      default: true
    });
  }
  
  console.log(chalk.cyan('\nThanks for playing! Goodbye! 👋\n'));
}

main().catch(console.error);
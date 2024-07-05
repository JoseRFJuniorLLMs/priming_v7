import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

interface Cell {
  letter: string;
  selected: boolean;
  found: boolean;
}

interface Word {
  text: string;
  found: boolean;
}

@Component({
  selector: 'app-word-search',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './word-search.component.html',
  styleUrls: ['./word-search.component.scss']
})
export class WordSearchComponent implements OnInit {
  grid: Cell[][] = [];
  words: Word[] = [];
  gridSize = 10;
  selection: { row: number; col: number }[] = [];

  ngOnInit() {
    this.newGame();
  }

  newGame() {
    this.words = [
      { text: 'ANGULAR', found: false },
      { text: 'TYPESCRIPT', found: false },
      { text: 'COMPONENT', found: false },
      { text: 'MATERIAL', found: false },
      { text: 'SEARCH', found: false }
    ];
    this.generateGrid();
    this.placeWords();
  }

  generateGrid() {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = {
          letter: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          selected: false,
          found: false
        };
      }
    }
  }

  placeWords() {
    const directions = [
      [0, 1],  // right
      [1, 0],  // down
      [1, 1],  // diagonal down-right
    ];

    for (const word of this.words) {
      let placed = false;
      while (!placed) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * this.gridSize);
        const col = Math.floor(Math.random() * this.gridSize);

        if (this.canPlaceWord(word.text, row, col, direction)) {
          this.placeWord(word.text, row, col, direction);
          placed = true;
        }
      }
    }
  }

  canPlaceWord(word: string, row: number, col: number, direction: number[]): boolean {
    if (row + word.length * direction[0] > this.gridSize || 
        col + word.length * direction[1] > this.gridSize) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const cell = this.grid[row + i * direction[0]][col + i * direction[1]];
      if (cell.letter !== word[i] && cell.letter !== '') {
        return false;
      }
    }

    return true;
  }

  placeWord(word: string, row: number, col: number, direction: number[]) {
    for (let i = 0; i < word.length; i++) {
      this.grid[row + i * direction[0]][col + i * direction[1]].letter = word[i];
    }
  }

  startSelection(row: number, col: number) {
    this.selection = [{ row, col }];
    this.grid[row][col].selected = true;
  }

  continueSelection(row: number, col: number) {
    if (this.selection.length > 0) {
      this.selection.push({ row, col });
      this.grid[row][col].selected = true;
    }
  }

  endSelection() {
    const selectedWord = this.selection.map(pos => this.grid[pos.row][pos.col].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const foundWord = this.words.find(word => 
      word.text === selectedWord || word.text === reversedWord
    );

    if (foundWord && !foundWord.found) {
      foundWord.found = true;
      this.selection.forEach(pos => {
        this.grid[pos.row][pos.col].found = true;
      });
    }

    this.grid.forEach(row => row.forEach(cell => cell.selected = false));
    this.selection = [];

    if (this.words.every(word => word.found)) {
      setTimeout(() => {
        alert('Congratulations! You found all words. Starting a new game.');
        this.newGame();
      }, 500);
    }
  }
}
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

interface Piece {
  letters: string[];
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss']
})
export class TetrisComponent implements OnInit {
  @ViewChild('board', { static: true }) boardCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;
  blockSize = 30;
  boardWidth = 10;
  boardHeight = 20;
  boardState: string[][] = [];
  currentPiece: Piece = { letters: [], x: 0, y: 0, color: '#333' }; // Cor padrão
  interval: any;

  wordGroups: { [key: string]: string[] } = {
    colors: [
      '#FF5733',   // Cor para cores
      '#34D4E5',   // Cor para números
      '#8E44AD',   // Cor para objetos
      '#3498DB',   // Cor para verbos
      '#F4D03F',   // Cor para adjetivos
      '#2ECC71'    // Cor para substantivos
    ],
    numbers: [
      "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
      "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY"
    ],
    objects: [
      "TABLE", "CHAIR", "LAMP", "CLOCK", "MIRROR", "BOOK", "PHONE", "COMPUTER", "KEYBOARD", "MOUSE",
      "PENCIL", "PAPER", "GLASS", "BOTTLE", "PLATE", "BOWL", "SPOON", "FORK", "KNIFE", "NAPKIN"
    ],
    verbs: [
      "RUN", "JUMP", "SING", "WRITE", "READ", "EAT", "DRINK", "SLEEP", "WALK", "TALK",
      "PLAY", "DANCE", "SWIM", "FLY", "DRIVE", "WORK", "STUDY", "DRAW", "LISTEN", "TEACH"
    ],
    adjectives: [
      "BIG", "SMALL", "FAST", "SLOW", "HIGH", "LOW", "HOT", "COLD", "GOOD", "BAD",
      "BEAUTIFUL", "UGLY", "STRONG", "WEAK", "HARD", "SOFT", "YOUNG", "OLD", "LIGHT", "DARK"
    ],
    nouns: [
      "APPLE", "BANANA", "ORANGE", "PEAR", "GRAPES", "MELON", "PINEAPPLE", "STRAWBERRY", "BLUEBERRY", "CHERRY",
      "CARROT", "CABBAGE", "POTATO", "TOMATO", "CUCUMBER", "ONION", "PEPPER", "EGGPLANT", "MUSHROOM", "BROCCOLI"
    ]
  };

  constructor() {
    this.initBoard();
  }

  ngOnInit(): void {
    const ctx = this.boardCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context');
    }
    this.context = ctx;
    this.startGame();
  }

  initBoard(): void {
    for (let y = 0; y < this.boardHeight; y++) {
      this.boardState[y] = new Array(this.boardWidth).fill('');
    }
  }

  startGame(): void {
    this.currentPiece = this.getRandomPiece();
    this.interval = setInterval(() => {
      this.update();
      this.draw();
    }, 1000);
  }

  update(): void {
    if (this.canPieceMoveDown()) {
      this.movePieceDown();
    } else {
      this.fixPieceToBoard();
      this.checkForCompletePhrases();
      this.currentPiece = this.getRandomPiece();
    }
  }

  canPieceMoveDown(): boolean {
    return this.currentPiece.y + this.currentPiece.letters.length < this.boardHeight;
  }

  movePieceDown(): void {
    this.currentPiece.y++;
  }

  fixPieceToBoard(): void {
    this.currentPiece.letters.forEach((row, y) => {
      row.split('').forEach((letter, x) => {
        if (letter !== ' ') {
          const boardY = this.currentPiece.y + y;
          const boardX = this.currentPiece.x + x;
          if (boardY >= 0 && boardY < this.boardHeight && boardX >= 0 && boardX < this.boardWidth) {
            this.boardState[boardY][boardX] = `${letter}-${this.currentPiece.color}`;
          }
        }
      });
    });
  }

  checkForCompletePhrases(): void {
    this.boardState.forEach((row, index) => {
      const phrase = row.join('').trim();
      for (const groupKey in this.wordGroups) {
        if (this.wordGroups[groupKey].includes(phrase)) {
          this.clearPhrase(index);
          break;
        }
      }
    });
  }

  clearPhrase(row: number): void {
    this.boardState.splice(row, 1);
    this.boardState.unshift(new Array(this.boardWidth).fill(''));
  }

  draw(): void {
    this.context.clearRect(0, 0, this.boardCanvas.nativeElement.width, this.boardCanvas.nativeElement.height);
  
    // Draw board
    this.boardState.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== '') {
          const [letter, color] = cell.split('-');
          this.context.fillStyle = color;
          this.context.font = 'bold 24px Arial';
          this.context.fillText(letter, x * this.blockSize, (y + 1) * this.blockSize);
        }
      });
    });
  
    // Draw current piece
    this.currentPiece.letters.forEach((row, y) => {
      row.split('').forEach((letter, x) => {
        if (letter !== ' ') {
          this.context.fillStyle = this.currentPiece.color;
          this.context.font = 'bold 24px Arial';
          this.context.fillText(letter, (this.currentPiece.x + x) * this.blockSize, (this.currentPiece.y + y + 1) * this.blockSize);
        }
      });
    });
  }

  
  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.movePieceLeft();
        break;
      case 'ArrowRight':
        this.movePieceRight();
        break;
      case 'ArrowDown':
        this.movePieceDown();
        break;
      case 'ArrowUp':
        this.rotatePiece();
        break;
    }
  }

  movePieceLeft(): void {
    if (this.currentPiece.x > 0) {
      this.currentPiece.x--;
    }
  }

  movePieceRight(): void {
    if (this.currentPiece.x + this.currentPiece.letters[0].length < this.boardWidth) {
      this.currentPiece.x++;
    }
  }

  rotatePiece(): void {
    // Função para girar a peça no sentido anti-horário
    const rotatedPiece = this.rotateMatrixCounterClockwise(this.currentPiece.letters);
    if (this.isValidRotation(rotatedPiece)) {
      this.currentPiece.letters = rotatedPiece;
    }
  }

  rotateMatrixCounterClockwise(matrix: string[]): string[] {
    const rotatedMatrix: string[] = [];
    for (let col = matrix[0].length - 1; col >= 0; col--) {
      let newRow = '';
      for (let row = 0; row < matrix.length; row++) {
        newRow += matrix[row][col];
      }
      rotatedMatrix.push(newRow);
    }
    return rotatedMatrix;
  }

  isValidRotation(rotatedPiece: string[]): boolean {
    // Verifica se a peça rotacionada cabe dentro dos limites do tabuleiro
    return (
      this.currentPiece.x + rotatedPiece[0].length <= this.boardWidth &&
      this.currentPiece.y + rotatedPiece.length <= this.boardHeight
    );
  }

  getRandomPiece(): Piece {
    const groupKeys = Object.keys(this.wordGroups);
    const randomGroupKey = groupKeys[Math.floor(Math.random() * groupKeys.length)];
    const randomIndex = Math.floor(Math.random() * this.wordGroups[randomGroupKey].length);
    const phrase = this.wordGroups[randomGroupKey][randomIndex];
    return {
      letters: [phrase],
      x: Math.floor((this.boardWidth - phrase.length) / 2), // Centraliza a peça horizontalmente
      y: 0,
      color: this.wordGroups['colors'][Math.floor(Math.random() * this.wordGroups['colors'].length)] // Seleciona uma cor aleatória
    };
  }

}

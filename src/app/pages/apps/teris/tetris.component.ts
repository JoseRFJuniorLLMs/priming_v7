import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

interface Piece {
  letters: string[];
  x: number;
  y: number;
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
  currentPiece: Piece = { letters: [], x: 0, y: 0 };
  interval: any;

  phrases: string[] = [
    "HELLO", "WORLD", "ANGULAR", "IS", "FUN", "BUILDING", "TETRIS",
  ];

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
          this.boardState[this.currentPiece.y + y][this.currentPiece.x + x] = letter;
        }
      });
    });
  }

  checkForCompletePhrases(): void {
    this.boardState.forEach((row, index) => {
      const phrase = row.join('').trim();
      if (this.phrases.includes(phrase)) {
        this.clearPhrase(index);
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
      row.forEach((letter, x) => {
        if (letter !== '') {
          this.context.fillStyle = '#333';
          this.context.fillText(letter, x * this.blockSize, (y + 1) * this.blockSize);
        }
      });
    });

    // Draw current piece
    this.currentPiece.letters.forEach((row, y) => {
      row.split('').forEach((letter, x) => {
        if (letter !== ' ') {
          this.context.fillStyle = '#ff9900';
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

  getRandomPiece(): Piece {
    const randomIndex = Math.floor(Math.random() * this.phrases.length);
    const phrase = this.phrases[randomIndex];
    return {
      letters: [phrase],
      x: Math.floor((this.boardWidth - phrase.length) / 2),
      y: 0
    };
  }
}
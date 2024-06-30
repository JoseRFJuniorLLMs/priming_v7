import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cols: number = 4;
  rowHeight: string = '100px';
  pieces: Piece[] = [
    {
      id: 1,
      position: { x: 0, y: 0 },
      originalPosition: { x: 0, y: 0 }, // Guarde a posição original
      image: 'https://placekitten.com/100/100'
    },
    // ... more pieces
  ];

  ngOnInit() {
    // Randomize as posições das peças (opcional)
    this.shufflePieces(); 
  }

  handleDrop(event: CdkDragDrop<Piece[]>) {
    moveItemInArray(this.pieces, event.previousIndex, event.currentIndex);
    this.updatePiecePositions(); 
    this.checkVictory();
  }

  updatePiecePositions() {
    this.pieces.forEach((piece, index) => {
      const col = index % this.cols;
      const row = Math.floor(index / this.cols);
      piece.position = { x: col, y: row };
    });
  }

  checkVictory() {
    const allPiecesInPlace = this.pieces.every(piece =>
      piece.position.x === piece.originalPosition.x &&
      piece.position.y === piece.originalPosition.y
    );

    if (allPiecesInPlace) {
      alert('Parabéns! Você completou o quebra-cabeça!');
    }
  }

  shufflePieces() {
    // Algoritmo para embaralhar o array de peças (se desejar)
  }
}

interface Piece {
  id: number;
  position: { x: number, y: number };
  originalPosition: { x: number, y: number }; // Posição inicial
  image: string;
}

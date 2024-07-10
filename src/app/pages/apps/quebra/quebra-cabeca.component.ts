import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

interface PuzzlePiece {
  position: string;
  correctPosition: string;
}

@Component({
  selector: 'quebra-cabeca',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './quebra-cabeca.component.html',
  styleUrls: ['./quebra-cabeca.component.scss']
})
export class QuebraCabecaComponent implements OnInit {
  imageUrl = '../../../../assets/img/game/frag.png';
  pieces: PuzzlePiece[] = [];
  isComplete = false;
  gridSize = 4; // 4x4 grid

  ngOnInit() {
    this.initializePuzzle();
  }

  initializePuzzle() {
    this.createPuzzlePieces();
    this.shufflePieces();
    this.isComplete = false;
  }

  createPuzzlePieces() {
    this.pieces = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const position = `${x * (100 / (this.gridSize - 1))}% ${y * (100 / (this.gridSize - 1))}%`;
        this.pieces.push({
          position: position,
          correctPosition: position
        });
      }
    }
  }

  shufflePieces() {
    this.pieces.sort(() => Math.random() - 0.5);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pieces, event.previousIndex, event.currentIndex);
    this.checkWinCondition();
  }

  checkWinCondition() {
    this.isComplete = this.pieces.every((piece, index) => {
      const correctY = Math.floor(index / this.gridSize);
      const correctX = index % this.gridSize;
      const correctPosition = `${correctX * (100 / (this.gridSize - 1))}% ${correctY * (100 / (this.gridSize - 1))}%`;
      return piece.position === correctPosition;
    });
    if (this.isComplete) {
      console.log('Parabéns! Você completou o quebra-cabeça!');
    }
  }

  resetPuzzle() {
    this.initializePuzzle();
  }
}

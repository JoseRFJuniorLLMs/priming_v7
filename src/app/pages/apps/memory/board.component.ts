import { Component, OnInit } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatRadioModule, MatDividerModule, CardComponent]
})
export class BoardComponent implements OnInit {
  cards: any[] = [];
  boardWidth!: number;
  cardCount: number = 8;
  moves: number = 0;
  remainingPairs: number = 0;

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.cards = this.cardService.getCards(this.cardCount);
    console.log('BoardComponent - New game started, cards:', this.cards);
    this.moves = 0;
    this.remainingPairs = this.cardCount;
    this.calculateWidth();
  }

  calculateWidth() {
    this.boardWidth = (this.cards.length / 2) * 110; // Adjust as needed
    console.log('BoardComponent - Calculated board width:', this.boardWidth);
  }

  cardFlipped(card: any) {
    this.moves++;
    console.log('BoardComponent - Card flipped, card:', card);
    // Logic to check for pairs and update remainingPairs
  }
}

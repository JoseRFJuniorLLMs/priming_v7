import { Component, OnInit } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CardComponent } from './card/card.component';

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
    this.moves = 0;
    this.remainingPairs = this.cardCount;
    this.calculateWidth();
  }

  calculateWidth() {
    this.boardWidth = (this.cards.length / 2) * 110; // Adjust as needed
  }

  cardFlipped(card: any) {
    this.moves++;
    // Logic to check for pairs and update remainingPairs
  }
}

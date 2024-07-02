import { Component, OnInit } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatCardModule]
})
export class CardComponent implements OnInit {
  cards: any[] = [];
  boardWidth!: number;
  moves: number = 0;
  remainingPairs: number = 0;
  private flippedCards: any[] = [];
  private checkInProgress = false;

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.cardService.getCards().subscribe(cards => {
      if (cards.length > 0) {
        const shuffled = cards.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 14);
        this.cards = [...selected, ...selected].sort(() => 0.5 - Math.random()).map(card => ({ ...card, isFlipped: false, isMatched: false }));
        this.moves = 0;
        this.remainingPairs = this.cards.length / 2;
        this.calculateWidth();
      } else {
        console.error('No valid cards found');
      }
    });
  }

  calculateWidth() {
    const columns = 7;
    this.boardWidth = columns * 110;
  }

  cardFlipped(card: any) {
    if (this.checkInProgress || card.isFlipped || card.isMatched) {
      return;
    }

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.checkInProgress = true;
      this.moves++;
      if (this.flippedCards[0].word === this.flippedCards[1].word) {
        this.flippedCards[0].isMatched = true;
        this.flippedCards[1].isMatched = true;
        this.remainingPairs--;
        this.flippedCards = [];
        this.checkInProgress = false;
      } else {
        setTimeout(() => {
          this.flippedCards[0].isFlipped = false;
          this.flippedCards[1].isFlipped = false;
          this.flippedCards = [];
          this.checkInProgress = false;
        }, 1000);
      }
    }
  }
}

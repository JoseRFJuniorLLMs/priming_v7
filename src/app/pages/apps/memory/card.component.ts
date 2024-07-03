import { Component, OnInit } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface Card {
  word: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class CardComponent implements OnInit {
  cards: Card[] = [];
  moves: number = 0;
  remainingPairs: number = 0;
  private flippedCards: Card[] = [];

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.cardService.getCards().subscribe(cards => {
      if (cards.length > 0) {
        const shuffled = cards.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        this.cards = [...selected, ...selected]
          .sort(() => 0.5 - Math.random())
          .map(card => ({
            ...card,
            isFlipped: false,
            isMatched: false
          }));
        this.moves = 0;
        this.remainingPairs = this.cards.length / 2;
      } else {
        console.error('No valid cards found');
      }
    });
  }

  flipCard(card: Card) {
    if (card.isFlipped || card.isMatched || this.flippedCards.length === 2) return;

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  private checkMatch() {
    setTimeout(() => {
      const [card1, card2] = this.flippedCards;
      if (card1.word === card2.word) {
        card1.isMatched = card2.isMatched = true;
        this.remainingPairs--;
      } else {
        card1.isFlipped = card2.isFlipped = false;
      }
      this.flippedCards = [];
    }, 1000);
  }
}
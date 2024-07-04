import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import cardsJSON from '../memory/cards.json';

interface Card {
  id: number;
  word: string;
  image?: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DinoService {
  private cards: Card[] = cardsJSON;
  private currentCardIndex = 0;

  getNextWord(): Observable<Card> {
    if (this.currentCardIndex >= this.cards.length) {
      this.currentCardIndex = 0;
    }
    const card = this.cards[this.currentCardIndex++];
    return of(card);
  }
}

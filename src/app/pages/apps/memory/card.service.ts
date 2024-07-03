import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import cardsJSON from './cards.json';

interface Card {
  id: number;
  word: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cards: Card[] = cardsJSON; // Assuming cardsJSON is your JSON file with 150 words
  private currentSeriesIndex = 0; // Index of the current series
  private cardsPerGame = 10; // Number of cards per game

  constructor(private http: HttpClient) {}

  getCardsForGame(): Observable<Card[]> {
    // Calculate the start and end index of the current series
    const startIndex = this.currentSeriesIndex * this.cardsPerGame;
    const endIndex = startIndex + this.cardsPerGame;

    // Select cards for the current game
    const cardsForGame = this.cards.slice(startIndex, endIndex);

    // Update series index for the next game
    this.currentSeriesIndex++;

    return of(cardsForGame).pipe(
      catchError(() => of([]))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { catchError, map, concatMap, toArray } from 'rxjs/operators';
import cardsJSON from './cards.json';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cards = cardsJSON;

  constructor(private http: HttpClient) {}

  getCards(): Observable<any[]> {
    const selectedCards = this.getRandomCards(5); // Seleciona 5 pares aleatórios (10 cartas no total)
    const cardObservables = selectedCards.map(card => this.checkImageExists(card.image).pipe(
      map(exists => exists ? card : null),
      catchError(() => of(null))
    ));
    
    return from(cardObservables).pipe(
      concatMap(obs => obs),
      toArray(),
      map(cards => cards.filter(card => card !== null)),
      map(cards => this.getPairs(cards, 5)) // Garante que no máximo 5 pares (10 cartas) sejam retornados
    );
  }

  private checkImageExists(url: string): Observable<boolean> {
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  private getRandomCards(count: number): any[] {
    const shuffled = this.cards.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getPairs(cards: any[], pairCount: number): any[] {
    const pairs = [];
    for (let i = 0; i < pairCount; i++) {
      pairs.push(...cards.filter((_, index) => index < pairCount));
    }
    return pairs;
  }
}

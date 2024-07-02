import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import cardsJSON from './cards.json';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cards = cardsJSON;

  constructor(private http: HttpClient) {}

  getCards(): Observable<any[]> {
    return of(this.cards).pipe(
      switchMap(cards => {
        const checks = cards.map(card => this.checkImageExists(card.image));
        return forkJoin(checks).pipe(
          map(results => cards.filter((_, index) => results[index]))
        );
      }),
      map(cards => cards.slice(0, 48)) // Ensure only 24 pairs (48 cards total)
    );
  }

  private checkImageExists(url: string): Observable<boolean> {
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }
}

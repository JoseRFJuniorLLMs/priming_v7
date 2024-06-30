import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { PrimeTargetCollection } from '../model/prime/prime';

@Injectable({
  providedIn: 'root'
})
export class PrimeTargetService {
  private readonly API = '/api/prime-target-collections';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<PrimeTargetCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<PrimeTargetCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(primeTarget: PrimeTargetCollection) {
    return this.http.post<PrimeTargetCollection>(this.API, primeTarget).pipe(
      first()
    );
  }

  update(primeTarget: PrimeTargetCollection) {
    return this.http.put<PrimeTargetCollection>(`${this.API}/${primeTarget._id}`, primeTarget).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<PrimeTargetCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}

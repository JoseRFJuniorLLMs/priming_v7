import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { PrimeTargetDictionaryCollection } from '../model/prime/prime-target-dictionary-collection';

@Injectable({
  providedIn: 'root'
})
export class PrimeTargetDictionaryService {
  private readonly API = '/api/prime-target-dictionary-collections';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<PrimeTargetDictionaryCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<PrimeTargetDictionaryCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(primeTarget: PrimeTargetDictionaryCollection) {
    return this.http.post<PrimeTargetDictionaryCollection>(this.API, primeTarget).pipe(
      first()
    );
  }

  update(primeTarget: PrimeTargetDictionaryCollection) {
    return this.http.put<PrimeTargetDictionaryCollection>(`${this.API}/${primeTarget._id}`, primeTarget).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<PrimeTargetDictionaryCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}

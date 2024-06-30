import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, tap } from 'rxjs';

import { AppConfigurl } from 'src/app/app-config_url';
import { PhrasePrime } from '../model/phrase/phrase-prime';
import { PhrasePrimePage } from './../model/phrase/phase-prime-page';

@Injectable({
  providedIn: 'root'
})
export class PhrasePrimeService {

  private readonly API = AppConfigurl.urlPhraseAll;

  private cache: PhrasePrime[] = [];

  constructor(private http: HttpClient) { }

  list(page = 0, pageSize = 10) {
    return this.http.get<PhrasePrimePage>(this.API, { params: { page, pageSize } }).pipe(
      first(),
      //map(data => data.phrase-prime),
      tap(data => (this.cache = data.phases))
    );
  }

  getById(id: string) {
    return this.http.get<PhrasePrime>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(primeTarget: PhrasePrime) {
    return this.http.post<PhrasePrime>(this.API, primeTarget).pipe(
      first()
    );
  }

  update(primeTarget: PhrasePrime) {
    return this.http.put<PhrasePrime>(`${this.API}/${primeTarget._id}`, primeTarget).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<PhrasePrime>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}

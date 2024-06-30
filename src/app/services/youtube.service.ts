import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs';
import { PrimeTargetYoutubeCollection } from '../model/prime/prime-target-youtube-collection';

@Injectable({
  providedIn: 'root'
})
export class PrimeTargetYoutubeService {
  private readonly API = '/api/prime-target-youtube';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<PrimeTargetYoutubeCollection[]>(this.API).pipe(
      first()
    );
  }

  getById(id: string) {
    return this.http.get<PrimeTargetYoutubeCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }

  create(primeTarget: PrimeTargetYoutubeCollection) {
    return this.http.post<PrimeTargetYoutubeCollection>(this.API, primeTarget).pipe(
      first()
    );
  }

  update(primeTarget: PrimeTargetYoutubeCollection) {
    return this.http.put<PrimeTargetYoutubeCollection>(`${this.API}/${primeTarget._id}`, primeTarget).pipe(
      first()
    );
  }

  delete(id: string) {
    return this.http.delete<PrimeTargetYoutubeCollection>(`${this.API}/${id}`).pipe(
      first()
    );
  }
}

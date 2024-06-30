import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Gpt4Service {
  private apiUrl = 'https://api.example.com/gpt4';

  constructor(private http: HttpClient) { }

  getGpt4Response(prompt: string): Observable<any> {
    const body = { prompt };
    return this.http.post<any>(this.apiUrl, body);
  }
}

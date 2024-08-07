// src/app/services/ollama.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {
  private apiUrl = 'http://localhost:11434/api/generate';

  constructor(private http: HttpClient) { }

  getResponse(prompt: string, model: string): Observable<string> {
    const payload = {
      model: model,
      prompt: prompt,
      stream: false
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(this.apiUrl, payload, {
      headers: headers,
      responseType: 'text' as 'json'
    });
  }
}

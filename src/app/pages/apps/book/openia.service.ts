import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import gpt4 from '../../../../../gpt4.json';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {

  private apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
  layout = 'single';

  constructor(private http: HttpClient) {}

  sendText(text: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
    });

    const body = {
      prompt: text,
      max_tokens: 50,
      temperature: 0.5,
    };

    return this.http.post(this.apiUrl, body, { headers });
  }



}

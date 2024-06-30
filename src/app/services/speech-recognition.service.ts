// No arquivo speech-recognition.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare var SpeechRecognition: any;

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  private recognition: any;
  public transcript = new Subject<string>();

  constructor() {
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: { results: { transcript: any; }[][]; }) => {
      const transcript = event.results[0][0].transcript;
      this.transcript.next(transcript);
    };

    this.recognition.onerror = (event: { error: any; }) => {
      console.error('Erro de reconhecimento de voz:', event.error);
    };
  }

  start() {
    this.recognition.start();
  }

  stop() {
    this.recognition.stop();
  }

  getTranscript() {
    return this.transcript.asObservable();
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import verboJSON from './verbos.json'; // Ajuste o caminho conforme necessário

interface Word {
  id: number;
  text: string;
  found: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private words: Word[] = verboJSON; 
  private currentBatch: number = 0;
  private batchSize: number = 10;

  loadWords(): Observable<Word[]> {
    return of(this.getNextBatch());
  }

  private getNextBatch(): Word[] {
    const start = this.currentBatch * this.batchSize;
    const end = start + this.batchSize;
    const batch = this.words.slice(start, end);
    this.currentBatch++;
    return batch;
  }
}

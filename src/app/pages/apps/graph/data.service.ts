import { Injectable } from '@angular/core';
import words from '../../../../assets/json/word.json';

import { NoteCollection } from '../note/note-collection';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private primeToTarget: { [key: string]: string } = {};
  private colorMapping: { [key: string]: string } = {};

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');
  noteCollection$!: Observable<NoteCollection[]>;

  durationInSeconds = 90;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private firestore: Firestore,
    private _snackBar: MatSnackBar
  ) {
    this.loadPrimeToTargetMapping();
    this.noteCollection$ = this.getNotes();
  }

  getNotes(): Observable<NoteCollection[]> {
    return collectionData(this.noteCollectionRef, {
      idField: '_id'
    }) as Observable<NoteCollection[]>;
  }

  getNoteById(id: string): Observable<NoteCollection> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return docData(noteDocRef, {
      idField: '_id'
    }) as Observable<NoteCollection>;
  }

  private loadPrimeToTargetMapping() {
    words.forEach((wordObj: any) => {
      const prime = wordObj['prime'].toLowerCase(); // Convertendo para minúsculas
      const target = wordObj['target'].toLowerCase(); // Convertendo para minúsculas
      this.primeToTarget[prime] = target;
      const color = this.getRandomColor();
      this.colorMapping[prime] = color;
      this.colorMapping[target] = color;
    });
  }

  private getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getSentences(): Observable<any[]> {
    return new Observable<any[]>(observer => {
      this.getNotes().subscribe((notes: NoteCollection[]) => {
        const primeSentences = new Map<string, Set<string>>();
        const targetSentences = new Map<string, Set<string>>();
        const nodeColors = new Map<string, string>();
        const uniqueSentences = new Set<string>();

        notes.forEach((note: NoteCollection) => {
          const sentence = note.description;
          if (sentence) {
            const wordsInSentence = new Set<string>(this.tokenize(sentence));
            let isRelated = false;

            wordsInSentence.forEach(word => {
              if (this.primeToTarget[word]) {
                if (!primeSentences.has(word)) {
                  primeSentences.set(word, new Set<string>());
                }
                primeSentences.get(word)?.add(sentence);
                nodeColors.set(sentence, this.colorMapping[word]);
                isRelated = true;
              }
              if (Object.values(this.primeToTarget).includes(word)) {
                if (!targetSentences.has(word)) {
                  targetSentences.set(word, new Set<string>());
                }
                targetSentences.get(word)?.add(sentence);
                nodeColors.set(sentence, this.colorMapping[word]);
                isRelated = true;
              }
            });

            if (!isRelated) {
              nodeColors.set(sentence, 'lightgrey');
            }
            uniqueSentences.add(sentence);
          }
        });

        observer.next(Array.from(uniqueSentences).map((sentence, index) => ({
          id: index + 1,
          shape: 'circularImage',
          image: 'https://priming-ai-2.web.app/assets/img/logo/priming.png',
          label: sentence,
          color: { background: nodeColors.get(sentence) || 'lightgrey' }
        })));
        observer.complete();
      });
    });
  }

  tokenize(text: string): string[] {
    return text.toLowerCase().split(/\W+/).filter(Boolean); // Convertendo para minúsculas
  }

  getCommonWordsMap(nodes: any[]): Map<string, number[]> {
    const wordMap = new Map<string, number[]>();

    const primeWords = Object.keys(this.primeToTarget);
    const targetWords = Object.values(this.primeToTarget);

    nodes.forEach((node) => {
      const wordsInNode = this.tokenize(node.label);
      const commonWords = wordsInNode.filter(word => primeWords.includes(word) || targetWords.includes(word));

      commonWords.forEach((word) => {
        if (wordMap.has(word)) {
          wordMap.get(word)!.push(node.id);
        } else {
          wordMap.set(word, [node.id]);
        }
      });
    });

    return wordMap;
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });
  }
}

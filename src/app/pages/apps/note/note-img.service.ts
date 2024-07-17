
import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { NoteCollection } from './note-collection';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap } from 'rxjs/operators';
import { SatoshiService } from './satoshi.service'; 
import gpt4 from '../../../../../gpt4.json';


@Injectable({
  providedIn: 'root'
})

export class NoteImgService {

    imagePrompt: string = '';
    generatedImageUrl: string = '';

    constructor(
        private firestore: Firestore,
        private _snackBar: MatSnackBar,
        private http: HttpClient,
      ) {
      }

/* ==================Generate Image From OpenAI==================== */
generateImageFromOpenAI(selectedText: string) {
    const openAIKey = gpt4.apiKey;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${openAIKey}`,
      'Content-Type': 'application/json'
    });
    const body = {
      model: 'dall-e-3',
      prompt: selectedText,
      quality: 'standard',
      size: '1024x1024',
      n: 1
    };
    this.http
      .post<any>('https://api.openai.com/v1/images/generations', body, {
        headers
      })
      .subscribe({
        next: (response) => {
          this.generatedImageUrl = response.data[0].url;
        },
        error: (error) => {
          console.error('Erro ao gerar a imagem:', error);
        }
      });
    } 


}//fim

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Firestore, doc, docData, setDoc, getDoc, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  public totalPages: number = 0;
  public currentPage: number = 0;
  public currentPageTextArray: string[] = [];
  public currentPageText: string = '';
  public currentSentenceIndex: number | null = null;
  public readingInProgress: boolean = false;
  public selectedVoice: SpeechSynthesisVoice | null = null;
  public voices: SpeechSynthesisVoice[] = [];
  public audioMode: boolean = false;
  public currentPageSubject = new Subject<number>();
  public currentPage$ = this.currentPageSubject.asObservable();
  public ebooks: Ebook[] = [];
  private ebooksSubject = new BehaviorSubject<Ebook[]>([]);
  public ebooks$ = this.ebooksSubject.asObservable();

  private pdfDoc: any = null;

  durationInSeconds = 10;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private firestore: Firestore
  ) {
    this.loadEbooks();
    this.initializeVoices();
    this.selectedVoice =
      this.voices.find((voice) => voice.name === 'Google US English') || null;
  }

  // Método para salvar a página atual no Firebase
  async saveCurrentPage(ebookId: string): Promise<void> {
    const userId = 'defaultUser'; // ID do usuário fixo
    const userDocRef = doc(this.firestore, `userProgress/${userId}`);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      await setDoc(userDocRef, { [ebookId]: this.currentPage }, { merge: true });
    } else {
      await setDoc(userDocRef, { [ebookId]: this.currentPage });
    }
  }

  // Método para recuperar a página salva do Firebase
  getCurrentPage(ebookId: string): Observable<number> {
    const userId = 'defaultUser'; // ID do usuário fixo
    const userDocRef = doc(this.firestore, `userProgress/${userId}`);
    return docData(userDocRef).pipe(
      map((data: any) => data ? data[ebookId] || 1 : 1)
    );
  }

  // Método para salvar o estado de conclusão no Firebase
  async markAsCompleted(ebookId: string, completed: boolean): Promise<void> {
    const userId = 'defaultUser'; // ID do usuário fixo
    const userDocRef = doc(this.firestore, `userProgress/${userId}`);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      await setDoc(userDocRef, { [`${ebookId}_completed`]: completed }, { merge: true });
    } else {
      await setDoc(userDocRef, { [`${ebookId}_completed`]: completed });
    }
  }

  // Método para verificar o estado de conclusão no Firebase
  getCompletionStatus(ebookId: string): Observable<boolean> {
    const userId = 'defaultUser'; // ID do usuário fixo
    const userDocRef = doc(this.firestore, `userProgress/${userId}`);
    return docData(userDocRef).pipe(
      map((data: any) => data ? data[`${ebookId}_completed`] || false : false)
    );
  }

  // Método para carregar eBooks do JSON local
  async loadEbooks(): Promise<void> {
    this.http.get<Ebook[]>('../../../../assets/pdf/clasepdf.json').subscribe(
      (data) => {
        if (data) {
          this.ebooks = data;
          this.ebooksSubject.next(this.ebooks);
        }
      },
      (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    );
  }

  // Método para retornar os eBooks como observable
  getEbooks(): Observable<Ebook[]> {
    return this.ebooks$;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError('Something bad happened; please try again later.');
  }

  private async initializeViewer(filePath: string, containerId: string): Promise<void> {
    this.openSnackBar('Initializing Viewer...');
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('Container not found');
    }
    container.innerHTML = '';

    const pdfViewer = document.createElement('ngx-extended-pdf-viewer');
    pdfViewer.setAttribute('src', filePath);
    container.appendChild(pdfViewer);
  }

  async initializeBook(filePath: string, containerId: string): Promise<void> {
    this.openSnackBar('Initializing Book...');
    try {
      await this.initializeViewer(filePath, containerId);
    } catch (error) {
      console.error('Error loading or rendering book: ', error);
    }
  }

  async renderPage(pageNumber: number, container: HTMLElement): Promise<void> {
    // Esta função pode ser ajustada ou removida dependendo do uso com ngx-extended-pdf-viewer
  }

  loadBookFromArrayBuffer(arrayBuffer: ArrayBuffer, containerId: string): void {
    const fileURL = URL.createObjectURL(new Blob([arrayBuffer], { type: 'application/pdf' }));
    this.initializeBook(fileURL, containerId);
  }

  async updateCurrentPage(containerId: string): Promise<void> {
    console.log('Updating current page...');
    const container = document.getElementById(containerId);
    if (this.pdfDoc && container) {
      await this.renderPage(this.currentPage, container);
      this.openSnackBar(`Current page: ${this.currentPage} / ${this.totalPages}`);
      if (this.audioMode && this.readingInProgress) {
        await this.processCurrentPageAudio();
      }
    }
  }

  async processCurrentPageAudio(): Promise<void> {
    console.log('Processing current page audio...');
    this.currentPageTextArray = this.splitIntoSentences(this.currentPageText);
    this.currentSentenceIndex = 0;
    if (this.audioMode && this.readingInProgress) {
      this.openSnackBar('Processing current page audio.');
      console.log('Audio mode is active and reading is in progress.');
    }
  }

  splitIntoSentences(text: string): string[] {
    console.log('Splitting text into sentences...');
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  }

  startReadingMode(): void {
    this.openSnackBar('Start Reading Mode');
    console.log('Starting reading mode...');
    this.audioMode = false;
    this.readingInProgress = false;
    speechSynthesis.cancel();
  }

  startAudioMode(): void {
    this.openSnackBar('Start Audio Mode');
    console.log('Starting audio mode...');
    this.audioMode = true;
    this.readingInProgress = true;
    this.processCurrentPageAudio();
  }

  pauseReading(): void {
    this.openSnackBar('Pause Reading');
    console.log('Pausing reading...');
    speechSynthesis.pause();
    this.readingInProgress = false;
  }

  resumeReading(): void {
    this.openSnackBar('Resume Reading');
    console.log('Resuming reading...');
    speechSynthesis.resume();
    this.readingInProgress = true;
    if (this.currentSentenceIndex !== null) {
      this.processCurrentPageAudio();
    }
  }

  nextPage(containerId: string, ebookId: string): void {
    this.openSnackBar('Next Page');
    console.log('Going to next page...');
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateCurrentPage(containerId);
      this.saveCurrentPage(ebookId); // Salva a página atual
    }
  }

  prevPage(containerId: string, ebookId: string): void {
    this.openSnackBar('Previous Page');
    console.log('Going to previous page...');
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateCurrentPage(containerId);
      this.saveCurrentPage(ebookId); // Salva a página atual
    }
  }

  async selectVoice(voice: SpeechSynthesisVoice) {
    if (this.selectedVoice === voice) {
      return;
    }
    if (this.readingInProgress) {
      speechSynthesis.cancel();
    }
    this.selectedVoice = voice;
    if (this.audioMode) {
      await this.processCurrentPageAudio();
    }
    console.log('Selected voice:', voice.name);
  }

  initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        this.voices = speechSynthesis.getVoices();
        this.selectedVoice =
          this.voices.find((voice) => voice.name === 'Google US English') ||
          null;
        speechSynthesis.onvoiceschanged = () => {
          this.voices = speechSynthesis.getVoices();
          this.selectedVoice =
            this.voices.find(
              (voice) => voice.name === 'Google US English'
            ) || null;
          resolve();
        };
      } else {
        resolve();
      }
    });
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: this.durationInSeconds * 200,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });
  }
}

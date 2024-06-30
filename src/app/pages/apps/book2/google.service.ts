import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  throwError,
  Subject,
  BehaviorSubject
} from 'rxjs';
import { Injectable } from '@angular/core';
import ePub from 'epubjs';
import gpt4 from '../../../../../gpt4.json';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';



interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}

interface Pdf {
  title: string;
  author: string;
  path: string;
  pageCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleBooksService {
  private apiKey = gpt4.apiKey;
  private baseUrl = gpt4.baseUrl;

  public book: any;
  public rendition: any;
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
  public bookEpub: ePub.Book | null = null;
  public ebooks: Ebook[] = [];
  private ebooksSubject = new BehaviorSubject<Ebook[]>([]);
  public ebooks$ = this.ebooksSubject.asObservable();

  private preloadedPages: { [key: number]: string } = {}; // Cache de páginas pré-carregadas

  public durationInSeconds = 130;
  public horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  public verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  public pdfDocument: any;
  public pdfTotalPages: number = 0;
  public pdfCurrentPage: number = 1;
  public pdfPageText: string = '';
  public pdfSubject = new Subject<number>();
  public pdf$ = this.pdfSubject.asObservable();

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.loadEbooks();
    this.initializeVoices();
    this.selectedVoice =
      this.voices.find((voice) => voice.name === 'Google US English') || null;
  }

  getTotalPages(): number {
    return this.totalPages;
  }

  getBook(bookId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/volumes/${bookId}?key=${this.apiKey}`)
      .pipe(catchError(this.handleError));
  }

  searchBooks(
    query: string,
    startIndex: number = 0,
    maxResults: number = 10
  ): Observable<any> {
    if (!query) {
      return throwError('Query cannot be empty');
    }
    return this.http
      .get(
        `${this.baseUrl}/volumes?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}&key=${this.apiKey}`
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError('Something bad happened; please try again later.');
  }

  private async initializeRendition(): Promise<void> {
    this.openSnackBar('initialize Rendition...');
    console.log('Initializing rendition...');
    this.rendition = this.book.renderTo('area-de-exibicao', {
      width: window.innerWidth,
      height: window.innerHeight,
      spread: 'none'
    });
    this.rendition.flow('scrolled-doc');
    await this.book.locations.generate(1024);
    this.totalPages = this.book.locations.length();
    await this.rendition.display();
    console.log('Rendition initialized. Total pages:', this.totalPages);
    this.updateCurrentPage();
  }

  initializeBook(filePath: string): Promise<void> {
    this.openSnackBar('Initialize Book....');
    console.log('Initializing book with file path:', filePath);
    return new Promise((resolve, reject) => {
      try {
        this.book = ePub(filePath);
        this.book.ready.then(() => {
          this.initializeRendition().then(resolve).catch(reject);
        });
      } catch (error) {
        console.error('Error loading or rendering book: ', error);
        reject(error);
      }
    });
  }

  loadBookFromArrayBuffer(arrayBuffer: ArrayBuffer): void {
    this.book = ePub(arrayBuffer);
    this.book.ready
      .then(() => {
        this.initializeRendition().catch((error) => {
          console.error('Error initializing rendition: ', error);
        });
      })
      .catch((error: any) => {
        console.error('Error loading book from array buffer: ', error);
      });
  }

  async updateCurrentPage(): Promise<void> {
    console.log('Updating current page...');
    const currentLocation = await this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      const pageIndex = await this.book.locations.locationFromCfi(
        currentLocation.start.cfi
      );
      this.currentPage = pageIndex + 1;
      this.currentPageSubject.next(this.currentPage); // Emite a mudança de página
      console.log(`Current page: ${this.currentPage} / ${this.totalPages}`);
      this.openSnackBar(
        `Current page: ${this.currentPage} / ${this.totalPages}`
      );

      // Atualiza o texto da página atual
      await this.getCurrentPageText();

      // Pre-carregar próximas páginas
      this.preloadPages();

      if (this.audioMode && this.readingInProgress) {
        await this.processCurrentPageAudio();
      }
    } else {
      console.log('Não foi possível determinar a localização atual.');
    }
  }

  async preloadPages(): Promise<void> {
    this.openSnackBar('Preload Pages');
    console.log('Preloading pages...');
    const nextPages = [this.currentPage + 1, this.currentPage + 2];
    for (const page of nextPages) {
      if (page <= this.totalPages && !this.preloadedPages[page]) {
        const cfi = this.book.locations.cfiFromLocation(page - 1);
        try {
          const currentLocation = await this.rendition.currentLocation();
          await this.rendition.display(cfi);
          const pageTextArray = await this.captureCurrentPageText();
          this.preloadedPages[page] = pageTextArray.join(' ');
          console.log(`Page ${page} preloaded`);
          this.openSnackBar(`Page ${page} preloaded`);
          await this.rendition.display(currentLocation.start.cfi);
        } catch (err: any) {
          console.error(`Error preloading page ${page}:`, err);
        }
      }
    }
  }

  async processCurrentPageAudio(): Promise<void> {
    console.log('Processing current page audio...');
    this.currentPageTextArray = this.preloadedPages[this.currentPage]
      ? this.splitIntoSentences(this.preloadedPages[this.currentPage])
      : await this.captureCurrentPageText();
    this.currentSentenceIndex = 0;
    if (this.audioMode && this.readingInProgress) {
      // Aqui é onde a lógica de leitura de áudio deve ser implementada
      this.openSnackBar('Processing current page audio.');
      console.log('Audio mode is active and reading is in progress.');
    }
  }

  captureCurrentPageText(): Promise<string[]> {
    console.log('Capturing current page text...');
    return new Promise((resolve) => {
      let currentPageText: string[] = [];
      const displayArea = document.getElementById('area-de-exibicao');
      const iframe = displayArea ? displayArea.querySelector('iframe') : null;
      const contentDocument = iframe
        ? iframe.contentDocument || iframe.contentWindow?.document
        : null;
      if (contentDocument && contentDocument.body) {
        const currentPageTextRaw = contentDocument.body.innerText || '';
        currentPageText = this.splitIntoSentences(currentPageTextRaw);
        console.log('Captured text:', currentPageText);
        resolve(currentPageText);
      } else {
        console.error(
          'Não foi possível acessar o conteúdo do iframe ou do documento.'
        );
        resolve([]);
      }
    });
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
    this.openSnackBar('Start Pause');
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
      console.error('resumeReading : this.currentSentenceIndex !== null');
    } else {
      this.processCurrentPageAudio();
    }
  }

  nextPage(): void {
    this.openSnackBar('Next Page');
    console.log('Going to next page...');
    this.rendition
      .next()
      .then(() => {
        this.updateCurrentPage();
      })
      .catch((err: any) => {
        console.error('Erro ao avançar para próxima página:', err);
      });
  }

  prevPage(): void {
    this.openSnackBar('Prev Page');
    console.log('Going to previous page...');
    this.rendition
      .prev()
      .then(() => {
        this.updateCurrentPage();
      })
      .catch((err: any) => {
        console.error('Erro ao voltar para página anterior:', err);
      });
  }

  changeRenderOption(option: string): void {
    switch (option) {
      case 'default':
        this.rendition.flow('scrolled-doc');
        break;
      case 'continuous':
        this.rendition.flow('scrolled-doc');
        break;
      case 'paginated':
        this.rendition.flow('paginated');
        break;
      case 'auto':
        this.rendition.spread('auto');
        break;
      default:
        this.rendition.flow('scrolled-doc');
        break;
    }
    console.log('Changed render option to:', option);
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
            this.voices.find((voice) => voice.name === 'Google US English') ||
            null;
          resolve();
        };
      } else {
        resolve();
      }
      console.log('Voices initialized:', this.voices);
    });
  }

  /* ==================Load Ebooks==================== */
  loadEbooks() {
    this.http.get<Ebook[]>('../../../../assets/epub/ebooks.json').subscribe(
      (data) => {
        this.ebooks = data;
        this.ebooksSubject.next(data); // Emite a lista atualizada
        console.log('Ebooks loaded Service:', this.ebooks);
      },
      (error) => {
        console.error('Error loading ebooks:', error);
      }
    );
  }

  /* ==================Select Ebook==================== */
  async selectEbook(ebook: Ebook) {
    const displayArea = document.getElementById('area-de-exibicao');
    if (displayArea) {
      displayArea.innerHTML = '';
    }
    try {
      if (ebook.path.endsWith('.pdf')) {
        await this.loadPdf(ebook.path);
      } else {
        this.book = ePub(ebook.path);
        console.log('Caminho do eBook selecionado:', ebook.path);
        await this.book.ready;
        this.rendition = this.book.renderTo('area-de-exibicao', {
          width: window.innerWidth,
          height: window.innerHeight,
          manager: 'continuous',
          spread: 'none'
        });
        await this.book.locations.generate(1024);
        this.totalPages = this.book.locations.length();
        this.currentPage = 1;
        this.rendition.display().then(() => {
          this.updateCurrentPageTextAndLocation();
        });
        this.rendition.on('relocated', (location: any) => {
          this.updateCurrentPageTextAndLocation();
        });
      }
    } catch (error) {
      console.error('Erro ao carregar ou renderizar o livro: ', error);
    }
  }

  /* ==================updateCurrentPageTextAndLocation==================== */
  async updateCurrentPageTextAndLocation() {
    await this.getCurrentPageText();
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      const pageIndex = this.book.locations.locationFromCfi(
        currentLocation.start.cfi
      );
      if (pageIndex !== undefined) {
        this.currentPage = pageIndex + 1;
        console.log(`Página atual: ${this.currentPage} / ${this.totalPages}`);
        this.openSnackBar(`Pag: ${this.currentPage} / ${this.totalPages}`);
      } else {
        console.log('CFI atual não encontrado nas localizações.');
      }
    } else {
      console.log('Não foi possível determinar a localização atual.');
    }
  }

  /* ==================Get Current Page Text==================== */
  public async getCurrentPageText(): Promise<void> {
    if (!this.rendition) {
      console.error('A renderização (rendition) não está disponível.');
      return;
    }

    try {
      let visibleContentText = '';
      const visibleContents = this.rendition.getContents();
      visibleContents.forEach(
        (content: { document: any; contentDocument: any }) => {
          const doc = content.document || content.contentDocument;
          if (doc && doc.body) {
            visibleContentText += doc.body.innerText || '';
          }
        }
      );

      this.currentPageText = visibleContentText.trim();
      console.log('Texto da página atual:', this.currentPageText);
      this.captureCurrentPageText();
    } catch (error) {
      console.error('Erro ao tentar obter o texto da página atual:', error);
    }
  }

  async loadEbook(path: string, elementId: string): Promise<void> {
    this.book = ePub(path);
    await this.book.ready;
    this.rendition = this.book.renderTo(elementId, {
      width: window.innerWidth,
      height: window.innerHeight,
      manager: 'continuous',
      spread: 'none'
    });
    await this.book.locations.generate(1024);
    this.totalPages = this.book.locations.length();
    this.currentPage = 1;
    this.rendition.display();
    this.rendition.on('relocated', () => {
      this.updateCurrentPageTextAndLocation();
    });
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100
    });
    snackBarRef.afterDismissed().subscribe(() => {});
  } //fim

  async extractFullBookText(): Promise<string> {
    if (!this.book) {
      throw new Error('No book is currently loaded.');
    }

    let fullText = '';
    for (let i = 0; i < this.totalPages; i++) {
      const cfi = this.book.locations.cfiFromLocation(i);
      await this.rendition.display(cfi);
      const pageText = await this.captureCurrentPageText();
      fullText += pageText.join(' ') + ' ';
    }
    return fullText;
  }

  async loadPdf(pdfPath: string): Promise<void> {
    this.openSnackBar('Loading PDF...');
    console.log('Loading PDF from path:', pdfPath);

    try {

      this.pdfTotalPages = this.pdfDocument.numPages;
      this.pdfCurrentPage = 1;
      await this.renderPdfPage(this.pdfCurrentPage);
      console.log('PDF loaded. Total pages:', this.pdfTotalPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  async renderPdfPage(pageNumber: number): Promise<void> {
    try {
      const page = await this.pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      const textContent = await page.getTextContent();
      const textItems = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      this.pdfPageText = textItems;
      this.pdfSubject.next(pageNumber);
      console.log(`Rendered PDF page: ${pageNumber}`);
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  }
  async nextPdfPage(): Promise<void> {
    if (this.pdfCurrentPage < this.pdfTotalPages) {
      this.pdfCurrentPage++;
      await this.renderPdfPage(this.pdfCurrentPage);
    }
  }

  async prevPdfPage(): Promise<void> {
    if (this.pdfCurrentPage > 1) {
      this.pdfCurrentPage--;
      await this.renderPdfPage(this.pdfCurrentPage);
    }
  }
}

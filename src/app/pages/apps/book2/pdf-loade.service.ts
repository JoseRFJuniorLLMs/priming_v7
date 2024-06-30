import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  throwError,
  Subject,
  BehaviorSubject
} from 'rxjs';
import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class PdfLoaderService {
  public pdfDocument: any;
  public pdfTotalPages: number = 0;
  public pdfCurrentPage: number = 1;
  public pdfPageText: string = '';
  public pdfSubject = new Subject<number>();
  public pdf$ = this.pdfSubject.asObservable();

  public ebooks: Ebook[] = [];
  private ebooksSubject = new BehaviorSubject<Ebook[]>([]);
  public ebooks$ = this.ebooksSubject.asObservable();

  public durationInSeconds = 130;
  public horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  public verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.loadEbooksPdf();
  }

  loadEbooksPdf() {
    this.http.get<Ebook[]>('../../../../assets/pdf/clasepdf.json').subscribe(
      (data) => {
        this.ebooks = data;
        this.ebooksSubject.next(data); // Emite a lista atualizada
        console.log('Ebooks PDF loaded Service:', this.ebooks);
      },
      (error) => {
        console.error('Error loading ebooks PDF:', error);
      }
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError('Something bad happened; please try again later.');
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

  async selectPdf(ebook: Ebook) {
    const displayArea = document.getElementById('area-de-exibicao');
    if (displayArea) {
      displayArea.innerHTML = '';
    }
    try {
      if (ebook.path.endsWith('.pdf')) {
        await this.loadPdf(ebook.path);
      }
    } catch (error) {
      console.error('Error loading or rendering PDF: ', error);
    }
  }

  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100
    });
    snackBarRef.afterDismissed().subscribe(() => {});
  }
}

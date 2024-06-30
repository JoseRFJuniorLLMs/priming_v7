import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAccordion,
  MatExpansionModule,
  MatExpansionPanel
} from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TextDialogComponent } from './text-dialog.component';
import { GoogleBooksService } from './google.service';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Observable, Subject, Subscription } from 'rxjs';
import screenfull from 'screenfull';
import { VexLayoutService } from '@vex/services/vex-layout.service';

import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent
} from '@angular/material/dialog';
import { FileDialogComponent } from './file-dialog.component';


interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}

@Component({
  selector: 'book2',
  templateUrl: 'book2.html',
  styleUrls: ['book2.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatBadgeModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatTooltipModule,
    CommonModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent
  ]
})
export class Book2Component implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion!: MatAccordion;
  @ViewChild('bookPanel') bookPanel!: MatExpansionPanel;
  @ViewChild('storePanel') storePanel!: MatExpansionPanel;

  @Input() collapsed: boolean = false;

  ebooks: Ebook[] = [];
  private subscription: Subscription = new Subscription();

  errorMessage: string | undefined;
  query: string = '';
  startIndex: number = 0;
  maxResults: number = 10;
  panelOpenState = false;
  public currentPage: number = 0;
  public totalPages: number = 0;
  selectedVoice: SpeechSynthesisVoice | null = null;
  voices: SpeechSynthesisVoice[] = [];
  currentPageTextArray: string[] = [];
  currentSentenceIndex: number | null = null;
  readingInProgress: boolean = false;
  audioMode: boolean = false;
  selectedLayoutOption: string = 'paginated';
  result: string | undefined;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isLoading: boolean = false;
  dialogRef: MatDialogRef<FileDialogComponent> | null = null;

  pageText: string = '';

  ebooks$: Observable<Ebook[]> | undefined;

  constructor(
    private layoutService: VexLayoutService,
    public booksService: GoogleBooksService,
    public dialog: MatDialog
  ) {
 
  }

  ngOnInit() {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.toggleCollapse();
    }
    this.subscription.add(
      this.booksService.ebooks$.subscribe((ebooks) => {
        this.ebooks = ebooks;
        console.log('Ebooks in component >>:', this.ebooks);
      })
    );

    this.booksService.currentPage$.subscribe((currentPage) => {
      this.currentPage = currentPage;
    });

    this.totalPages = this.booksService.getTotalPages();
    this.booksService.initializeVoices().then(() => {
      this.voices = this.booksService.voices;
      this.selectedVoice = this.booksService.selectedVoice;
    });

  } //fim


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.loadEpub(file);
    }
    this.closeDialog2();
  } //fim

  loadEpub(file: File): void {
    this.openDialog2('200ms', '150ms');
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = (e.target as FileReader).result as ArrayBuffer;
      this.booksService.loadBookFromArrayBuffer(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
    this.closeDialog2();
  } //fim

  searchBooks(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService
      .searchBooks(this.query, this.startIndex, this.maxResults)
      .subscribe(
        (data) => {
          if (data && data.items) {
            this.ebooks = this.ebooks.concat(data.items);
            this.closeDialog2();
          }
        },
        (error) => {
          this.errorMessage = error;
        }
      );
  } //fim

  loadMore(): void {
    this.openDialog2('200ms', '150ms');
    this.startIndex += this.maxResults;
    this.searchBooks();
    this.closeDialog2();
  } //fim

  onSearch(): void {
    this.openDialog2('200ms', '150ms');
    if (!this.query) {
      this.errorMessage = 'Search query cannot be empty';
      return;
    }
    this.ebooks = [];
    this.startIndex = 0;
    this.searchBooks();
    this.closeDialog2();
  } //fim

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subscription.unsubscribe();
  } //fim

  initializeVoices(): void {
    this.booksService.initializeVoices();
    this.voices = this.booksService.voices;
    this.selectedVoice = this.booksService.selectedVoice;
  } //fim

  selectVoice(voice: SpeechSynthesisVoice): void {
    this.booksService.selectVoice(voice);
    this.selectedVoice = voice;
  } //fim

  startReadingMode(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.startReadingMode();
    this.closeDialog2();
  } //fim

  startAudioMode(): void {
    this.openDialog2('200ms', '150ms');
    this.isLoading = true;
    this.audioMode = true;
    this.readingInProgress = true;
    this.booksService
      .processCurrentPageAudio()
      .then(() => {
        console.log(
          'Texto da página atual:',
          this.booksService.currentPageTextArray
        );
        this.currentPageTextArray = this.booksService.currentPageTextArray;
        this.openDialog();
      })
      .catch((error) => {
        console.error('Erro ao processar áudio da página atual:', error);
      });
  } //fim

  pauseReading(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.pauseReading();
    this.closeDialog2();
  } //fim

  resumeReading(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.resumeReading();
    this.closeDialog2();
  } //fim

  nextPage(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.nextPage();
    this.closeDialog2();
  } //fim

  prevPage(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.prevPage();
    this.closeDialog2();
  } //fim

  changeRenderOption(option: string): void {
    this.openDialog2('200ms', '150ms');
    this.selectedLayoutOption = option;
    this.booksService.changeRenderOption(option);
    this.closeDialog2();
  } //fim

  openDialog(): void {
    const dialogRef = this.dialog.open(TextDialogComponent, {
      width: '100vw',
      height: '85vh',
      data: { text: this.currentPageTextArray.join(' ') }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.result = result;
    });
  } //fim

  private processAndReadCurrentPage(): void {
    this.openDialog2('200ms', '150ms');
    this.booksService.captureCurrentPageText().then((currentPageTextArray) => {
      this.currentPageTextArray = currentPageTextArray;
      this.readCurrentPageText();
      this.closeDialog2();
    });
  } //fim

  private readCurrentPageText(): void {
    this.openDialog2('200ms', '150ms');
    if (this.currentPageTextArray.length > 0 && this.audioMode) {
      const utterance = new SpeechSynthesisUtterance(
        this.currentPageTextArray.join(' ')
      );
      utterance.voice = this.selectedVoice;
      utterance.onend = () => {
        this.nextPage();
        this.processAndReadCurrentPage();
        this.closeDialog2();
      };
      utterance.onerror = () => {};
      window.speechSynthesis.speak(utterance);
    }
  } //fim

  async selectEbook(ebook: Ebook) {
    this.openDialog2('200ms', '150ms');
    const displayArea = document.getElementById('area-de-exibicao');
    if (displayArea) {
      displayArea.innerHTML = '';
      this.closeDialog2();
    }
    try {
      this.openDialog2('200ms', '150ms');
      await this.booksService.loadEbook(ebook.path, 'area-de-exibicao');
      this.storePanel.close();
      this.bookPanel.open();
      this.closeDialog2();
    } catch (error) {
      console.error('Erro ao carregar ou renderizar o livro: ', error);
    }
  } //fim

  async fullRead(): Promise<void> {
    this.openDialog2('200ms', '150ms');
    try {
      const fullText = await this.booksService.extractFullBookText();
      this.dialog.open(TextDialogComponent, {
        data: { text: fullText }
      });
      this.closeDialog2();
    } catch (error) {
      console.error('Error during full read:', error);
    }
  } //fim

  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  } //fim

  openDialog2(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialogRef = this.dialog.open(FileDialogComponent, {
      width: '400px',
      height: '200px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }

  closeDialog2() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
} //fim

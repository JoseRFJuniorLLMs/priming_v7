import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import screenfull from 'screenfull';
import { VozComponent } from '../puzzle-block/voz.component';
import { PuzzleBlockComponent } from '../puzzle-block/puzzle-block.component';
import { GoogleBooksService } from './google.service';

@Component({
  selector: 'text-dialog',
  templateUrl: 'text-dialog.component.html',
  styleUrls: ['text-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    VozComponent,
    PuzzleBlockComponent
  ]
})
export class TextDialogComponent implements OnInit {
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice = new FormControl<SpeechSynthesisVoice | null>(null);
  sentences: string[] = [];
  currentSentenceIndex: number = 0;
  currentWordIndex: number = 0;
  readingMode: 'sentence' | 'word' | null = null;
  isLoaded: boolean = false;
  @ViewChild('textContainer') textContainer!: ElementRef;

  sentencesRead: number = 0; // rastreia o número de sentenças lidas
  sentencesToScroll: number = 1; // rolar para cima após ler este número de sentenças

  constructor(
    public booksService: GoogleBooksService,
    public dialogRef: MatDialogRef<TextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { text: string }
  ) {
    this.sentences = this.splitIntoSentences(data.text);
  }

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
    this.loadVoices();
  }

  loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      this.voices = voices;
      this.booksService.openSnackBar('Load Voices');
    } else {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
      };
    }
  }

  chooseReadingMode(mode: 'sentence' | 'word') {
    this.readingMode = mode;
    this.currentSentenceIndex = 0; // Reinicia o índice da sentença
    if (mode === 'sentence') {
      this.readCurrentSentence();
      this.booksService.openSnackBar('Reading Mode Sentence');
    } else if (mode === 'word') {
      this.readCurrentSentenceByWord();
      this.booksService.openSnackBar('Reading Mode Word');
    }
  }

  readCurrentSentence() {
    if (this.currentSentenceIndex < this.sentences.length) {
      const sentence = this.sentences[this.currentSentenceIndex];
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.voice = this.selectedVoice.value;
      utterance.onend = () => {
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentences.length) {
          this.readCurrentSentence();
          this.scrollIntoViewIfNeeded();
        }
      };
      speechSynthesis.speak(utterance);
    }
  }

  readCurrentSentenceByWord() {
    if (this.currentSentenceIndex < this.sentences.length) {
      const sentence = this.sentences[this.currentSentenceIndex];
      const words = sentence.split(' ');
      this.currentWordIndex = 0;
      this.readCurrentWord(words);
    }
  }

  readCurrentWord(words: string[]) {
    if (this.currentWordIndex < words.length) {
      const word = words[this.currentWordIndex];
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.voice = this.selectedVoice.value ?? null;
      utterance.onstart = () => {
        this.updateHighlight();
      };
      utterance.onend = () => {
        this.currentWordIndex++;
        if (this.currentWordIndex < words.length) {
          this.readCurrentWord(words);
        } else {
          this.currentSentenceIndex++;
          if (this.currentSentenceIndex < this.sentences.length) {
            this.readCurrentSentenceByWord();
          }
        }
      };
      speechSynthesis.speak(utterance);
    }
  }

  updateHighlight() {
    this.scrollIntoViewIfNeeded();
  }

  scrollIntoViewIfNeeded() {
    const currentSentenceElement =
      this.textContainer.nativeElement.querySelectorAll('p')[
        this.currentSentenceIndex
      ];
    if (currentSentenceElement) {
      currentSentenceElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  scrollUpSentences() {
    let newIndex = this.currentSentenceIndex - this.sentencesToScroll;
    newIndex = Math.max(0, newIndex);
    const targetElement =
      this.textContainer.nativeElement.querySelectorAll('p')[newIndex];
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onCloseClick(): void {
    this.dialogRef.close();
    speechSynthesis.cancel();
  }

  stopReading(): void {
    this.dialogRef.close();
    speechSynthesis.cancel();
  }

  // Função para ativar o tema escuro
  toggleDarkTheme() {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  }

  // Função para ativar o tema claro
  toggleLightTheme() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }

  startSpeaking() {
    this.chooseReadingMode('sentence');
  }

  pauseSpeaking() {
    speechSynthesis.pause();
  }

  resumeSpeaking() {
    speechSynthesis.resume();
  }

  cancelSpeaking() {
    speechSynthesis.cancel();
  }

  nextPage() {
    this.booksService.nextPage();
  }

  splitIntoSentences(text: string): string[] {
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  }
}

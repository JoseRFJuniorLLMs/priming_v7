import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EMPTY, Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'rsvpreader',
  standalone: true,
  templateUrl: './rsvpreader.component.html',
  styleUrls: ['./rsvpreader.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatTooltipModule,
    MatCardModule,
    MatToolbarModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
  ]
})
export class RsvpreaderComponent implements OnInit{

  chatMessage: string = this.data.texto;
  @Input() text: string = '';
  selectedText: string = '';
  words: string[] = [];
  currentWord = '';
  currentWordFormatted: SafeHtml | undefined;
  currentIndex = 0;
  readingInterval: any;
  intervalSpeed = 200;
  private textSubscription: Subscription = EMPTY.subscribe();

  constructor(
    //private sharedDataService: SharedDataService,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: { texto: string }
    ) {}

  ngOnInit() {
      this.words = this.chatMessage.split(' ');
  }

  ngOnChanges(): void {
    this.words = this.text.split(',').map(word => word.trim());
    this.currentIndex = 0;
  }

  ngOnDestroy() {
    this.textSubscription.unsubscribe();
    this.stopReading();
  }

  startReading() {
    if (this.readingInterval) {
      return; // Impede a criação de múltiplos intervalos se já estiver lendo
    }

    this.readingInterval = setInterval(() => {
      if (this.currentIndex < this.words.length) {
        const word = this.words[this.currentIndex++];
        this.currentWord = word;
        this.currentWordFormatted = this.formatWord(word);
      } else {
        this.stopReading(); // Para a leitura quando todas as palavras forem lidas
      }
    }, this.intervalSpeed);
  }


  stopReading() {
    clearInterval(this.readingInterval);
    this.readingInterval = null;
    this.currentIndex = 0;
  }

  adjustSpeed(speed: number) {
    this.intervalSpeed = speed;
    if (this.readingInterval) {
      this.stopReading();
      this.startReading();
    }
  }

  formatWord(word: string): SafeHtml {
    if (word.length > 1) {
      const middleIndex = Math.floor(word.length / 2);
      const formattedWord = `${word.substring(0, middleIndex)}<span class="highlight">${word[middleIndex]}</span>${word.substring(middleIndex + 1)}`;
      return this.sanitizer.bypassSecurityTrustHtml(formattedWord);
    }
    return this.sanitizer.bypassSecurityTrustHtml(word);
  }
}

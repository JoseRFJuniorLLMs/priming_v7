import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Voice5RecognitionService } from './voice5-recognition.service';

@Component({
  selector: 'dialogbook3',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  sentences: string[];
  nlpResults: any[];
  spokenText: string = '';
  currentSentenceIndex: number = -1;
  canSpeak: boolean = false;
  playClicked: boolean[] = [];
  speakClicked: boolean[] = [];
  instructions: string = 'Listen to the sentence';

  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sentences: string[], nlpResults: any },
    private voiceRecognitionService: Voice5RecognitionService
  ) {
    this.sentences = data.sentences;
    this.nlpResults = data.nlpResults;
    this.playClicked = Array(this.sentences.length).fill(false);
    this.speakClicked = Array(this.sentences.length).fill(false);
  }

  ngOnInit(): void {
    this.voiceRecognitionService.spokenText$.subscribe(spokenText => {
      this.spokenText = spokenText;
    });

    this.loadVoices();
  }

  loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      this.voices = voices;
    } else {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
      };
    }
  }

  onVoiceChange(event: Event): void {
    const selectedVoiceName = (event.target as HTMLSelectElement).value;
    this.selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName) || null;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  togglePlaySentence(index: number): void {
    this.playClicked[index] = !this.playClicked[index];
    if (this.playClicked[index]) {
      this.stopSentence();
    } else {
      this.playSentence(this.sentences[index], index);
    }
  }

  playSentence(sentence: string, index: number): void {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.highlightWord(event.charIndex, sentence);
      }
    };

    utterance.onend = () => {
      this.canSpeak = true;
      this.currentSentenceIndex = index;
    };

    speechSynthesis.speak(utterance);
  }

  stopSentence(): void {
    speechSynthesis.cancel();
  }

  toggleSpeakSentence(index: number): void {
    this.speakClicked[index] = !this.speakClicked[index];
    if (this.speakClicked[index]) {
      this.voiceRecognitionService.stopListening();
    } else {
      this.speakSentence(index);
    }
  }

  speakSentence(index: number): void {
    if (!this.canSpeak) return;

    this.voiceRecognitionService.startListening();
  }

  highlightWord(charIndex: number, sentence: string): void {
    const words = sentence.split(' ');
    let currentCharIndex = 0;
    let highlightedSentence = '';

    words.forEach((word, index) => {
      if (currentCharIndex <= charIndex && charIndex < currentCharIndex + word.length) {
        highlightedSentence += `<span class="highlighted-word">${word}</span> `;
      } else {
        highlightedSentence += `${word} `;
      }
      currentCharIndex += word.length + 1; // Inclui o espaço após a palavra
    });

    this.spokenText = highlightedSentence.trim();
  }

  highlightWords(sentence: string, sentenceIndex: number): string {
    const words = sentence.split(' ');
    return words.map((word, wordIndex) => `<span class="word" id="sentence-${sentenceIndex}-word-${wordIndex}" style="font-size: 24px; font-family: Calibri;">${word}</span>`).join(' ');
  }
}

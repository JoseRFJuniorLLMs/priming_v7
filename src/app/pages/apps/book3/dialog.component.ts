import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Voice5RecognitionService } from './voice5-recognition.service';
import { Subscription } from 'rxjs';

import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatChipsModule } from '@angular/material/chips';

import { SatoshiService } from '../note/satoshi.service';
import { NoteService } from '../note/note.service';
import { NoteCollection } from '../note/note-collection';
import { Student } from 'src/app/model/student/student';
import { AuthService } from '../../pages/auth/login/auth.service';

@Component({
  selector: 'dialogbook3',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule, MatBadgeModule, MatBottomSheetModule, MatChipsModule
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {
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
  studentId: string = ''; // Agora iremos obter o ID do estudante logado
  totalSatoshis = 0;
  showSatoshiAlert = false;
  private satoshiSubscription: Subscription | null = null;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sentences: string[], nlpResults: any },
    private voiceRecognitionService: Voice5RecognitionService,
    private satoshiService: SatoshiService,
    private authService: AuthService, // Injetamos o AuthService aqui
    private noteService: NoteService, // Injetamos o NoteService aqui
    private cdr: ChangeDetectorRef 
  ) {
    this.sentences = data.sentences;
    this.nlpResults = data.nlpResults;
    this.playClicked = Array(this.sentences.length).fill(false);
    this.speakClicked = Array(this.sentences.length).fill(false);
  }

  async ngOnInit(): Promise<void> {
    // Obtemos o ID do usuário logado
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      this.studentId = currentUser.uid;
      this.updateSatoshiBalance();
    }

    this.voiceRecognitionService.spokenText$.subscribe(spokenText => {
      this.spokenText = spokenText;
    });

    this.loadVoices();
  }

  ngOnDestroy(): void {
    if (this.satoshiSubscription) {
      this.satoshiSubscription.unsubscribe();
    }
  }

  updateSatoshiBalance() {
    this.satoshiSubscription = this.satoshiService.getSatoshiBalance(this.studentId).subscribe(
      balance => {
        this.totalSatoshis = balance;
      },
      error => console.error('Error fetching satoshi balance:', error)
    );
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
    if (this.playClicked[index]) {
      this.stopSentence();
      this.playClicked[index] = false;
    } else {
      this.playClicked[index] = true;
      this.playSentence(this.sentences[index], index);
    }
    this.showSubtitle(this.sentences[index]); // Atualiza a legenda com a nova frase
  }
  
  playSentence(sentence: string, index: number): void {
    this.stopSentence(); // Garante que qualquer síntese de fala em andamento seja interrompida antes de iniciar uma nova
  
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
      this.playClicked[index] = false; // Reseta o estado do botão de reprodução após finalizar a fala
      this.incrementSatoshiAndCreateNote(this.sentences[index]); // Incrementa satoshi e cria uma nota

      // Show subtitle with the spoken text
      this.showSubtitle(sentence);
    };
  
    speechSynthesis.speak(utterance);
  }

  stopSentence(): void {
    speechSynthesis.cancel();
  }

  toggleSpeakSentence(index: number): void {
    this.speakClicked[index] = !this.speakClicked[index];
    if (this.speakClicked[index]) {
      this.voiceRecognitionService.startListening(); // Inicia o reconhecimento de voz quando o botão fica vermelho
    } else {
      this.voiceRecognitionService.stopListening(); // Para o reconhecimento de voz quando o botão fica verde
    }
  }

  speakSentence(index: number): void {
    if (!this.canSpeak) return;

    this.voiceRecognitionService.startListening();
  }

  highlightWord(charIndex: number, sentence: string): void {
    const words = sentence.split(' ');
    let currentCharIndex = 0;
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      currentCharIndex += word.length + 1;
      if (currentCharIndex > charIndex) {
        const wordElement = document.querySelector(`#sentence-${this.currentSentenceIndex}-word-${wordIndex}`);
        this.highlightWordElement(wordElement);
        break;
      }
    }
    this.cdr.markForCheck(); // Garante que a mudança seja detectada
  }

  highlightWordElement(element: Element | null): void {
    if (element) {
      document.querySelectorAll('.highlighted-word').forEach(el => el.classList.remove('highlighted-word'));
      element.classList.add('highlighted-word');
    }
  }

  highlightWords(sentence: string, sentenceIndex: number): string {
    const words = sentence.split(' ');
    return words.map((word, wordIndex) => `<span class="word" id="sentence-${sentenceIndex}-word-${wordIndex}" style="font-size: 24px; font-family: Calibri;">${word}</span>`).join(' ');
  }

  incrementSatoshiAndCreateNote(sentence: string) {
    const firstWord = sentence.split(' ')[0];
    const note = new NoteCollection({
      title: firstWord,
      description: sentence,
      created_at: new Date().toISOString(),
      student: { _id: this.studentId } as Student
    });
  
    this.noteService.createNote(note).then(() => {
      this.updateSatoshiBalance();
      this.showSatoshiAlert = true;
      this.cdr.markForCheck(); // Trigger change detection
  
      setTimeout(() => {
        this.showSatoshiAlert = false;
        this.cdr.markForCheck(); // Trigger change detection
      }, 2000);
    }).catch(error => {
      console.error('Erro ao criar nota e incrementar saldo de satoshi:', error);
    });
  }

  showSubtitle(sentence: string): void {
    this.spokenText = sentence; // Define o texto falado como a legenda
    this.cdr.markForCheck(); // Aciona a detecção de mudanças
  }
}

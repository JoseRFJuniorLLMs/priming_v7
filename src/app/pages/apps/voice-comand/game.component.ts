import { Component, ElementRef, Inject, Input, OnInit, ViewChild, NgZone, ChangeDetectorRef, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { VoiceRecognitionService } from './voice-recognition.service';
import WaveSurfer from 'wavesurfer.js';
import screenfull from 'screenfull';
import { FlashcardComponent } from '../note/list/flashcard.component';
import { SatoshiService } from '../note/satoshi.service'; // Verifique o caminho correto
import { NoteCollection } from '../note/note-collection';

@Component({
  selector: 'game-component',
  templateUrl: './game-component.html',
  styleUrls: ['./game-component.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, 
    MatExpansionModule,
    MatTooltipModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSliderModule,
    FormsModule,
    FlashcardComponent
  ]
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {

  student$!: Observable<any[]>;
  private satoshiSubscription: Subscription | null = null;

  @ViewChild('mic') micElement!: ElementRef<HTMLDivElement>;
  @ViewChild('micSelect') micSelectElement!: ElementRef<HTMLSelectElement>;
  @ViewChild('waveformPlay') waveformPlay!: ElementRef;

  @Input() recordedUrl: string | undefined;

  isPanelExpanded: boolean = true;
  recognition: any;
  message: string = '';
  speak: string = '';
  commandCounter: number = 0;
  currentPhraseIndex: number = 0;

  combinations: Set<string> = new Set();
  totalCombinations: number;
  currentPage: number = 0;
  pageSize: number = 9;

  legendas: string[] = [];
  collapsed: any;
  layoutService: any;

  whos = ['i', 'you', 'we', 'they', 'he', 'she', 'it', 'people', 'someone', 'everyone'];
  whys = ['can', 'want', 'like', 'need', 'loves', 'hates', 'prefers', 'enjoy', 'has to', 'should'];
  actions = ['go', 'see', 'eat', 'play', 'work', 'drive', 'stay', 'listen', 'study', 'visit'];
  wheres = ['to the store', 'the movie', 'at the restaurant', 'in the park', 'at the office', 'to the city', 'at home', 'to music', 'in the library', 'the museum'];

  allCombinations: { who: string, why: string, action: string, where: string }[] = [];
  currentCombinations: { who: string, why: string, action: string, where: string }[] = [];

  private flashcardDialogRef: any;
  filteredNotes$!: Observable<NoteCollection[]>;

  private studentId = 'student-id';
  totalSatoshis = 0;
  showSatoshiAlert = false;

  constructor(
    private cdr: ChangeDetectorRef, // Mudança de cdRef para cdr para manter consistência
    public dialog: MatDialog,
    private elementRef: ElementRef,
    @Inject(Firestore) private firestore: Firestore,
    private zone: NgZone,
    private soundService: SoundService,
    private voiceRecognitionService: VoiceRecognitionService,
    @Inject(SatoshiService) private satoshiService: SatoshiService // Adicionando o SatoshiService
  ) {
    const student = collection(this.firestore, 'StudentCollection'); // Verifique o nome correto da coleção
    this.student$ = collectionData(student) as Observable<any[]>;

    this.totalCombinations = this.whos.length * this.whys.length * this.actions.length * this.wheres.length;
    this.generateCombinations();
    this.updateCurrentCombinations();
  }

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
    this.voiceRecognitionService.init();
    this.voiceRecognitionService.command$.subscribe(command => {
      this.zone.run(() => this.executeVoiceCommand(command));
    });

    this.voiceRecognitionService.recordingEnded$.subscribe(url => {
      this.recordedUrl = url;
      this.createWaveSurferPlay(url);
    });

    this.startVoiceRecognition();
    this.updateSatoshiBalance(); // Atualiza o saldo de satoshi ao iniciar o componente
  }

  ngAfterViewInit(): void {
    this.voiceRecognitionService.setupWaveSurfer(this.micElement);
    this.startRecording();
  }

  ngOnDestroy(): void {
    if (this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
    this.voiceRecognitionService.stopListening();
    this.voiceRecognitionService.stopRecording();
    this.soundService.playErro();
    if (this.satoshiSubscription) {
      this.satoshiSubscription.unsubscribe(); // Cancelar a assinatura ao destruir o componente
    }
  }

  updateSatoshiBalance() {
    this.satoshiSubscription = this.satoshiService.getSatoshiBalance(this.studentId).subscribe(
      (balance: number) => {
        this.totalSatoshis = balance;
        this.cdr.detectChanges(); // Forçar a detecção de mudanças
      },
      (error: any) => console.error('Error fetching satoshi balance:', error)
    );
  }

  generateCombinations(): void {
    for (const who of this.whos) {
      for (const why of this.whys) {
        for (const action of this.actions) {
          for (const where of this.wheres) {
            this.allCombinations.push({ who, why, action, where });
          }
        }
      }
    }
  }

  updateCurrentCombinations(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.currentCombinations = this.allCombinations.slice(start, end);
  }

  nextPage(): void {
    this.currentPage++;
    this.updateCurrentCombinations();
    this.currentPhraseIndex = 0; 
  }

  updateHint(event: any): void {
    this.commandCounter = event.value;
    this.cdr.detectChanges();
  }

  startVoiceRecognition(): void {
    this.voiceRecognitionService.startListening();
  }

  cleanCommand(command: string): string {
    return command.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  executeVoiceCommand(command: string): void {
    const cleanedCommand = this.cleanCommand(command);
    const parsedCommand = this.parseCommand(cleanedCommand);
  
    if (parsedCommand) {
      const commandKey = `${parsedCommand.who} ${parsedCommand.why} ${parsedCommand.action} ${parsedCommand.where}`;
      if (!this.combinations.has(commandKey)) {
        this.combinations.add(commandKey);
        this.commandCounter++;
        this.cdr.detectChanges();
        if (this.commandCounter === this.pageSize) {
          this.nextPage();
        }
      }
  
      if (this.currentPhraseIndex < this.currentCombinations.length - 1) {
        this.currentPhraseIndex++;
      } else {
        this.nextPage();
      }
      
      this.speak = `${parsedCommand.who} ${parsedCommand.why} ${parsedCommand.action} ${parsedCommand.where}`;
      this.soundService.playDone();
      this.incrementSatoshi(); // Incrementa satoshi ao reconhecer um comando válido
    } else {
      this.message = `${cleanedCommand}`;
      this.soundService.playErro();
      this.speakText(`${cleanedCommand}`);
    }
  }

  parseCommand(command: string): { who: string, why: string, action: string, where: string } | null {
    const whoPattern = this.whos.join('|');
    const whyPattern = this.whys.join('|');
    const actionPattern = this.actions.join('|');
    const wherePattern = this.wheres.join('|');

    const regex = new RegExp(`(${whoPattern})\\s+(${whyPattern})\\s+(${actionPattern})\\s+(${wherePattern})`);
    const match = command.match(regex);

    if (match) {
      return { who: match[1], why: match[2], action: match[3], where: match[4] };
    }

    return null;
  }

  incrementSatoshi(): void {
    this.satoshiService.incrementSatoshi(this.studentId, 1).subscribe(
      () => {
        this.totalSatoshis++;
        this.showSatoshiAlert = true;
        this.cdr.detectChanges(); // Forçar a detecção de mudanças
        setTimeout(() => {
          this.showSatoshiAlert = false;
          this.cdr.detectChanges(); // Forçar a detecção de mudanças
        }, 3000);
      },
      (error: any) => console.error('Error incrementing satoshi:', error)
    );
  }

  createWaveSurferPlay(url: string): void {
    if (this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
    this.voiceRecognitionService.wavesurfer = WaveSurfer.create({
      container: this.waveformPlay.nativeElement,
      waveColor: '#6c63ff',
      progressColor: '#FE7F9C',
      barWidth: 4,
      cursorWidth: 1,
      height: 100,
      normalize: true
    });

    this.voiceRecognitionService.wavesurfer.load(url);
  }

  startRecording(): void {
    this.voiceRecognitionService.startRecording();
  }

  speakText(message: string): void {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
  }
}

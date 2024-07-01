import { Component, ElementRef, Inject, Input, OnInit, ViewChild, NgZone, ChangeDetectorRef, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importando CommonModule
import { Observable } from 'rxjs';
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
import { FlashcardComponent } from '../../dashboards/components/dialog-flashcard/flashcard.component';
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

  isDialogOpen: boolean = false; 
  dialogRef: any = null;
  showFlashCard: boolean = false;

  whos = ['i', 'you', 'we', 'they', 'he', 'she', 'it', 'people', 'someone', 'everyone'];
  whys = ['can', 'want', 'like', 'need', 'loves', 'hates', 'prefers', 'enjoy', 'has to', 'should'];
  actions = ['go', 'see', 'eat', 'play', 'work', 'drive', 'stay', 'listen', 'study', 'visit'];
  wheres = ['to the store', 'the movie', 'at the restaurant', 'in the park', 'at the office', 'to the city', 'at home', 'to music', 'in the library', 'the museum'];

  allCombinations: { who: string, why: string, action: string, where: string }[] = [];
  currentCombinations: { who: string, why: string, action: string, where: string }[] = [];

  constructor(
    public dialog: MatDialog,
    private elementRef: ElementRef,
    @Inject(Firestore) private firestore: Firestore,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
    private soundService: SoundService,
    private voiceRecognitionService: VoiceRecognitionService
  ) {
    const student = collection(this.firestore, 'Student');
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
  }

  ngAfterViewInit(): void {
    this.voiceRecognitionService.setupWaveSurfer(this.micElement);
    this.startRecording();
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
    this.cdRef.detectChanges();
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
        this.cdRef.detectChanges();
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

    const regex = new RegExp(`(${whoPattern})\\s+(${whyPattern})\\s+(${actionPattern})\\s+(${wherePattern})`, 'i');
    const match = command.match(regex);

    if (match) {
      return {
        who: match[1],
        why: match[2],
        action: match[3],
        where: match[4]
      };
    }
    return null;
  }

  startRecording(): void {
    this.voiceRecognitionService.startRecording();
  }

  createWaveSurferPlay(url: string): void {
    if (!this.waveformPlay || !this.waveformPlay.nativeElement) {
      return;
    }

    const wavesurferPlay = WaveSurfer.create({
      container: this.waveformPlay.nativeElement,
      waveColor: 'black',
      progressColor: 'gray',
      barWidth: 2,
      cursorWidth: 1,
      height: 60,
      barGap: 3,
      backend: 'WebAudio',
    });

    wavesurferPlay.load(url);
  }

  playBiNeural(): void {
    this.soundService.playBiNeural();
  }

  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  }

  speakText(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
  
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name === 'Google UK English Female');
  
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        console.warn('Voz "Google UK English Female" não encontrada, usando a voz padrão.');
      }
  
      window.speechSynthesis.speak(utterance);
    };
  
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }

   /* ==================Open Dialog FlashCard==================== */
   openDialogFlashCard(): void {
    this.isDialogOpen = true;
    // Verifica se já existe um diálogo aberto
    if (this.dialogRef) {
      // Fecha o diálogo atual antes de abrir um novo
      this.dialogRef.close();
    }
    // Abre o novo diálogo e armazena sua referência
    this.dialogRef = this.dialog.open(FlashcardComponent, {
      width: '900px',
      height: '800px'
      //data: { texto: textDisplay }
    });
    // Quando o diálogo for fechado, limpa a referência
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.isDialogOpen = false; // Resetar quando o diálogo é fechado
    });
  } //fim

  /* ==================Toggle Flash Card==================== */
  toggleFlashCard() {
    this.showFlashCard = !this.showFlashCard;
  } //fim


  ngOnDestroy(): void {
    if (this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
    this.voiceRecognitionService.stopListening();
    this.voiceRecognitionService.stopRecording();
    this.soundService.playErro();
  }

}

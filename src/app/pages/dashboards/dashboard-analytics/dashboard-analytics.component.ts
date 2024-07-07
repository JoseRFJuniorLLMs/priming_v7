import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import gpt4 from '../../../../../gpt4.json';

import { WidgetAssistantComponent } from '../components/widgets/widget-assistant/widget-assistant.component';
import { WidgetLargeChartComponent } from '../components/widgets/widget-large-chart/widget-large-chart.component';
import { WidgetLargeGoalChartComponent } from '../components/widgets/widget-large-goal-chart/widget-large-goal-chart.component';
import { WidgetQuickLineChartComponent } from '../components/widgets/widget-quick-line-chart/widget-quick-line-chart.component';
import { WidgetQuickValueCenterComponent } from '../components/widgets/widget-quick-value-center/widget-quick-value-center.component';
import { WidgetTableComponent } from '../components/widgets/widget-table/widget-table.component';

import { MatStepperModule } from '@angular/material/stepper';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger80ms } from '@vex/animations/stagger.animation';

import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexHighlightDirective } from '@vex/components/vex-highlight/vex-highlight.directive';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import nlp from 'compromise';
import { interval, Observable, Subscription } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram';
import Hover from 'wavesurfer.js/dist/plugins/hover';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { WordComponent } from '../components/word/word.component';
import { Course } from 'src/app/model/course/course';
import { SharedDataService } from 'src/app/services/sahred-data.service';
import { TextToSpeechService } from 'src/app/services/text-to-speech.service';
import { CoursesService } from '../../../services/courses.service';
import { BookComponent } from '../../apps/book/book.component';
import { GraphComponent } from '../../apps/graph/graph.component';
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';
import { DialogIAComponent } from '../components/dialog-ia/dialog-ia.component';
import { RsvpreaderComponent } from '../components/dialog-rsvpreader/rsvpreader.component';
import { ImagemPopupComponent } from './imagem-popup.component';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { FlashcardComponent } from '../components/dialog-flashcard/flashcard.component';
import { StudentComponent } from '../../apps/student/form/student.component';
import { PuzzleBlockComponent } from '../../apps/puzzle-block/puzzle-block.component';
import { NoteComponent } from '../../apps/note/note.component';
import { ChatVideoComponent } from '../../apps/chat-video/chat-video.component';
import { ClaseComponent } from '../../apps/clase/clase.component';
import { Book3Component } from '../../apps/book3/book3.component';
import { NoteListComponent } from '../../apps/note/list/note-list.component';
import { CardComponent } from '../../apps/memory/card.component';


// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  animations: [stagger80ms, fadeInUp400ms, scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatBottomSheetModule,
    MatListModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    WidgetAssistantComponent,
    WidgetQuickLineChartComponent,
    WidgetLargeGoalChartComponent,
    WidgetQuickValueCenterComponent,
    WidgetLargeChartComponent,
    WidgetTableComponent,
    PageLayoutDemoComponent,
    MatTabsModule,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    VexPageLayoutComponent,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatStepperModule,
    MatChipsModule,
    VexHighlightDirective,
    WordComponent,
    BookComponent,
    GraphComponent,
    RsvpreaderComponent,
    MatSlideToggleModule,
    StudentComponent,
    PuzzleBlockComponent,
    NoteComponent,
    ChatVideoComponent,
    MatExpansionModule,
    ClaseComponent,
    Book3Component,
    NoteListComponent,
    CardComponent

  ]
})
export class DashboardAnalyticsComponent implements OnInit, AfterViewInit {
 
  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;
  @ViewChild(RsvpreaderComponent) rsvpReader!: RsvpreaderComponent;
  /* @ViewChild('waveformContainer') waveformContainer!: ElementRef;
  @ViewChild('waveformCanvasRef') waveformCanvasRef!: ElementRef<HTMLCanvasElement>; */

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private subscription: Subscription = new Subscription();
  public isPlaying: boolean = false;
  isTranscribing = false;
  textToSpeech!: string;
  audioBlob!: Blob;
  audioUrl!: string;

  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';
  selectedText: string = '';
  data: any;
  currentTime!: string;
  progressPercentage: number = 0;
  mediaControlsEnabled: boolean = false;
  mediaControlIcon: string = 'mat:sports_esports';
  wordsArray: string[] = [];
  wordsDisplayed: number = 0;
  wordDuration: number = 0;
  result: any;
  imageDisplayed: boolean = false;
  dialogRef: any = null;
  isDialogOpen: boolean = false; 
  private isGeneratingAudio: boolean = false;
  private readyListener: () => void;
  private finishListener: () => void;
  mostrarImagem: boolean = true;

  //NLP - Manipulação de Texto
  textNLP: string = '';
  pronouns: string[] = []; // Pronome
  verbs: string[] = []; // Verbo
  nouns: string[] = []; // Substantivo
  adjectives: string[] = []; // Adjetivo
  adverbs: string[] = []; // Advérbio
  people: string[] = []; // Pessoas
  places: string[] = []; // Lugares
  organizations: string[] = []; // Organizações
  dates: string[] = []; // Datas
  values: string[] = []; // Valores

  // Adicionando novas variáveis para funcionalidades adicionais
  phrases: string[] = []; // Frases
  clauses: string[] = []; // Cláusulas
  negations: string[] = []; // Negativas
  questions: string[] = []; // Perguntas
  quotes: string[] = []; // Citações
  acronyms: string[] = []; // Siglas
  emails: string[] = []; // E-mails
  urls: string[] = []; // URLs
  emojis: string[] = []; // Emojis
  mentions: string[] = []; // Menções (@usuario)
  hashtags: string[] = []; // Hashtags

  musicFiles = [
    'ABOVE.wav',
    'ADVANCE.wav',
    'FULL.wav',
    'FULL2.wav',
    'music.mp3',
    'PRIMING.wav'
  ];
 
  dataSource = new MatTableDataSource<Course>();
  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('isExpanded');
  selectedChip: 'phrase' | 'text' | 'word' | 'srvp' | null = null;

  volume: number = 50; // Valor inicial para o volume
  speed: number = 100; // Valor inicial para a velocidade

  showRSVPReader: boolean = false;
  showFlashCard: boolean = false;

  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  voiceSelection: string = 'defaultVoice'; // Valor inicial para voz selecionada
  selectedVoice: string = ''; // Adiciona a declaração para 'selectedVoice'

  imagePrompt: string = '';
  generatedImageUrl: string = '';

  /* ==================CONTRUTOR==================== */
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private sharedDataService: SharedDataService,
    private textToSpeechService: TextToSpeechService,
  ) {
    this.readyListener = () => {};
    this.finishListener = () => {};
  }

  //======================FIM CONSTRUTO=================//

  /* ==================OnINIT==================== */
  ngOnInit(): void {

    this.performAnalysis();
    this.abrirPopup();
    this.analyzeText();
    this.subscription = interval(1000).subscribe(() => {
      this.getCurrentTime();
    });
  } //fim

  /* ==================ngAfter ViewInit==================== */
  ngAfterViewInit(): void {
    this.initWaveSurfer();
  } //fim

  /* ==================Update Voice Selection==================== */
  updateVoiceSelection(voice: string) {
    this.voiceSelection = voice;
  } //fim

  /* ==================abrirPopup==================== */
  abrirPopup() {
    this.dialog.open(ImagemPopupComponent, {});
  } //sim

  /* ==================Dialog Speach IA==================== */
  openDialogSpeach(textDisplay: string): void {
    this.isDialogOpen = true;
    // Verifica se já existe um diálogo aberto
    if (this.dialogRef) {
      // Fecha o diálogo atual antes de abrir um novo
      this.dialogRef.close();
    }

    // Abre o novo diálogo e armazena sua referência
    this.dialogRef = this.dialog.open(DialogIAComponent, {
      width: '900px',
      height: '800px',
      data: { texto: textDisplay }
    });

    this.dialogRef.afterOpened().subscribe(() => {
      this.performAnalysis();
    });

    // Quando o diálogo for fechado, limpa a referência
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.isDialogOpen = false; // Resetar quando o diálogo é fechado
    });
  } //fim

  /* ==================Some Method That SelectsText==================== */
  someMethodThatSelectsText(text: string) {
    this.sharedDataService.setSelectedText(text);
  } //fim

  /* ==================Toggle RSVP Reader==================== */
  toggleRSVPReader() {
    this.showRSVPReader = !this.showRSVPReader;
  } //fim

  /* ==================Open Dialog SRVP==================== */
  openDialogSRVP(textDisplay: string): void {
    this.isDialogOpen = true;
    // Verifica se já existe um diálogo aberto
    if (this.dialogRef) {
      // Fecha o diálogo atual antes de abrir um novo
      this.dialogRef.close();
    }

    // Abre o novo diálogo e armazena sua referência
    this.dialogRef = this.dialog.open(RsvpreaderComponent, {
      width: '900px',
      height: '800px',
      data: { texto: textDisplay }
    });
    // Quando o diálogo for fechado, limpa a referência
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.isDialogOpen = false; // Resetar quando o diálogo é fechado
    });
  } //fim

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

   /* ==================OnDESTROY==================== */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  } //fim

  /* ==================CONSOME API DA OPEN IA==================== */
  async questionToOpenAI(
    question: string,
    selection: 'phrase' | 'text' | 'word'
  ) {
    this.isLoading = true;
    try {
      const headers = {
        Authorization: `Bearer ${gpt4.apiKey}`,
        'Content-Type': 'application/json'
      };

      let contentMessage = `repeat this ${selection}: ${question}`;
      if (selection === 'phrase') {
        contentMessage +=
          ', and provide more sentences that contain the word simple and children';
        this.openSnackBar('Phrase');
      } else if (selection === 'text') {
        this.openSnackBar('Text');
        contentMessage += `generate a children's text, which is fanciful, absurd, which uses memory techniques from the memory palace that you know, highlighting the central part of the story and the word: ${selection}`;
      } else if (selection === 'word') {
        this.openSnackBar('Word');
        contentMessage += ', ';
      }
      const response = await this.http
        .post<any>(
          gpt4.baseUrl,
          {
            messages: [{ role: 'user', content: contentMessage }],
            temperature: 0.7, //0.7 criativo
            max_tokens: 200,
            model: 'gpt-4' //gpt-3.5-turbo //gpt-4 //GPT-4-0613
          },
          { headers }
        )
        .toPromise();

      if (
        !response ||
        !response.choices ||
        response.choices.length === 0 ||
        !response.choices[0].message
      ) {
        throw new Error('Resposta da API não contém dados válidos.');
      }

      this.chatMessage = response.choices[0].message.content;
      const displayTime = this.displayTextWordByWord(this.chatMessage);
      setTimeout(() => this.generateAudio(), displayTime);
    } catch (error) {
      this.errorText =
        'Falha ao obter resposta da API (OPEN IA): ' + (error as Error).message;
      this.openSnackBar(this.errorText);
    } finally {
      this.isLoading = false;
    }
  } //fim

  /* ==================Handle Response=================== */
  private handleResponse(response: any) {
    this.chatMessage = response.choices[0].message.content;
    const displayTime = this.displayTextWordByWord(this.chatMessage);
    // Agora `generateAudio` é chamado corretamente com `selectedVoice` como argumento
    setTimeout(() => this.generateAudio(), displayTime);
  } //fim

  /* ==================handleError =================== */
  private handleError(error: any) {
    this.errorText =
      'Falha ao obter resposta da API (OPEN IA): ' + (error as Error).message;
    this.openSnackBar(this.errorText);
  } //fim

  /* ==================SELECTION PHASE TEXT WORD==================== */
  onSelection(selection: 'phrase' | 'text' | 'word' | 'srvp') {
    this.selectedChip = this.selectedChip === selection ? null : selection;
    this.openSnackBar('Now you have to select a text...(' + selection + ')');
  } //fim

  /* ==================WAVESURFER==================== */
  private initWaveSurfer(): void {
    //this.isPlaying = true;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      url: '../../assets/audio/micro-machines.wav',
      waveColor: '#d3d3d3',
      progressColor: 'rgb(0, 0, 0)',
      cursorColor: 'rgb(0, 0, 0)',
      cursorWidth: 6,
      barGap: 3,
      barWidth: 2,
      barHeight: 3,
      barRadius: 10,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      fillParent: true,
      autoplay: false,
      /*minPxPerSec: 50,
        mediaControls: true, //controles
          */
      plugins: [
        Spectrogram.create({
          container: '#spectrogram',
          labels: true,
          height: 100,
          splitChannels: false,
          labelsHzColor: 'rgb(255, 255, 255)',
          labelsColor: 'rgb(255, 255, 255)'
          //labelsBackground: 'rgb(200, 0, 200)',
        }),

        Hover.create({
          lineColor: '#ff0000',
          lineWidth: 2,
          labelBackground: '#555',
          labelColor: '#fff',
          labelSize: '11px'
        })
      ]
    });
    this.waveform.on('audioprocess', () => {
      this.updateTextDisplayBasedOnAudio();
    });
    this.waveform.setVolume(0.1); // 10/100
    this.waveform.on('audioprocess', (currentTime) =>
      this.updatePlaybackHint(currentTime)
    );
    this.waveform.on('pause', () => this.hidePlaybackHint());
    this.waveform.on('finish', () => (this.isPlaying = false));
  } //fim

  /* ==================events==================== */
  events() {
    this.waveform.once('interaction', () => {
      this.waveform.play();
    });

    this.waveform.on('play', () => {
      this.isPlaying = true;
    });

    this.waveform.on('pause', () => {
      this.isPlaying = false;
    });
  } //fim

  /* ==================toggleAudio==================== */
  toggleAudio() {
    if (this.isPlaying) {
      this.waveform.pause();
    } else {
      document.addEventListener('click', () => {
        this.waveform.play();
      }, { once: true });
      this.textToSpeechService.speak(this.chatMessage); // Legenda do Chrome
    }
    this.isPlaying = !this.isPlaying;
  }//fim

  /* ==================FUNCAO PARA PEGAR O ARRAY DE STRING==================== */
  getWordsArray(text: string): string[] {
    return text.split(' ');
  } //fim

  /* ==================CARREGAR E DA PLAY AUDIO==================== */
  loadAndPlayAudio(
    audioUrl: string,
    text: string,
    onAudioFinish?: () => void
  ): void {
    this.wordsArray = this.getWordsArray(text); // Divide o texto em palavras
    this.wordsDisplayed = 0; // Reseta o contador de palavras exibidas

    // Carrega o áudio a partir da URL fornecida
    this.waveform.load(audioUrl);

    // Quando o WaveSurfer estiver pronto, calcula a duração de cada palavra e inicia a reprodução
    this.waveform.on('ready', () => {
      const duration = this.waveform.getDuration(); // Obtém a duração total do áudio
      this.wordDuration = duration / this.wordsArray.length; // Calcula a duração de cada palavra
      this.waveform.play(); // Inicia a reprodução do áudio
      this.openSnackBar('Begin Play Wav');
    });

    // Adiciona um listener para o evento de término do áudio
    // Se um callback foi fornecido, ele será chamado ao terminar a reprodução
    this.waveform.on('finish', () => {
      this.isPlaying = false;
      if (onAudioFinish) {
        onAudioFinish(); // Chama o callback fornecido
      }
    });
  } //fim

  /* ==================FULL TEXT==================== */
  displayFullText(text: string): void {
    const displayElement = document.getElementById('textDisplay');
    if (displayElement) {
      displayElement.textContent = text;
    }
  } //fim

  /* ==================ATUALIZA O TEXTO BASEADO NO AUDIO==================== */
  updateTextDisplayBasedOnAudio(): void {
    // Verifica se a imagem já foi exibida. Se sim, não faz nada para evitar sobrepor a imagem.
    if (this.imageDisplayed) {
      return;
    }

    // Se a imagem ainda não foi exibida, continua com a lógica de atualizar o texto baseado no progresso do áudio.
    const currentTime = this.waveform.getCurrentTime(); // Obtém o tempo atual do áudio.
    const expectedWords = Math.floor(currentTime / this.wordDuration); // Calcula quantas palavras deveriam ter sido faladas até o momento.

    // Atualiza o displayElement para mostrar as palavras até o ponto esperado.
    const displayElement = document.getElementById('textDisplay');
    if (displayElement) {
      // Atualiza o texto no displayElement com as palavras correspondentes ao tempo atual do áudio.
      displayElement.textContent = this.wordsArray
        .slice(0, expectedWords)
        .join(' ');
    }
  } //fim

  /* ==================PLAY AUDIO TEXTO SICRONIZADO==================== */
  startAudioWithText(audioUrl: string, text: string) {
    this.loadAndPlayAudio(audioUrl, text);
    this.openSnackBar('Play Audio Sicrono: ' + text);
  } //fim

  /* ==================PLAY AUDIO==================== */
  playAudio() {
    this.waveform.play();
    this.openSnackBar('waveform: Play');
    this.textToSpeechService.speak(this.chatMessage); // Legenda do Chome
  } //fim

  /* ==================PAUSE AUDIO==================== */
  pauseAudio() {
    this.waveform.pause();
    this.openSnackBar('waveform: Pause');
  } //fim

  /* ==================STOP AUDIO==================== */
  stopAudio() {
    this.waveform.stop();
    this.openSnackBar('waveform: Stop');
  } //fim

  /* ==================CURRENT TIME==================== */
  getCurrentTime(): void {
    const currentTime = this.waveform.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    this.currentTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  } //fim

  /* ==================CALCULA PORCENTAGEM DE PROGRESSO==================== */
  calculateProgressPercentage(): void {
    const duration = this.waveform.getDuration();
    const currentTime = this.waveform.getCurrentTime();
    this.progressPercentage = (currentTime / duration) * 100;
  } //fim

  /* ==================MOSTRO OS CONTROLES DO VOLUME==================== */
  toggleMediaControls(): void {
    this.mediaControlsEnabled = !this.mediaControlsEnabled;
    this.waveform.setOptions({ mediaControls: this.mediaControlsEnabled });
    this.mediaControlIcon = this.mediaControlsEnabled
      ? 'mat:sports_esports'
      : 'mat:cloud_download';
    this.openSnackBar('Progress: ' + this.mediaControlIcon);
  } //fim

  /* ==================VOZ ALEATORIA==================== */
  getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.voices.length);
    this.openSnackBar('Voz: ' + this.voices[randomIndex]);
    return this.voices[randomIndex];
  } //fim

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100
    });
    snackBarRef.afterDismissed().subscribe(() => {});
  } //fim

  /* ==================ALARME==================== */
  playSound(soundUrl: string) {
    const audio = new Audio(soundUrl);
    audio.play().catch((error) => console.error('Erro ao tocar o som:', error));
  } //fim

  /* ==================AO SELECIONAR O TEXTO==================== */
  @HostListener('document:mouseup', ['$event'])
  handleMouseUp(event: MouseEvent) {
    // Ignora eventos originados de sliders de volume ou velocidade
    if (
      event.target &&
      (event.target as HTMLElement).tagName === 'INPUT' &&
      (event.target as HTMLInputElement).type === 'range'
    ) {
      return;
    }
    // Não faz nada se um diálogo está aberto
    if (this.isDialogOpen) {
      return;
    }
    const selection = window.getSelection();
    const selectedText =
      selection && selection.rangeCount > 0 ? selection.toString().trim() : '';
    if (selectedText !== '') {
      if (!this.selectedChip) {
       // this.playSound('../../../../assets/audio/SELECT.wav'); todo: OPENAI 
        this.openSnackBar(
          'Please select a button first to categorize the text'
        );
        return; 
      }
      this.selectedText = selectedText;
      if (this.selectedChip === 'srvp') {
        this.openDialogSRVP(selectedText); 
      } else {
        this.questionToOpenAI(selectedText, this.selectedChip);
      }
    }
  } //fim

  /* ==================GERA AUDIO==================== */
  generateAudio(): void {
    // Verifica se já está gerando áudio para evitar duplicação
    if (!this.chatMessage || !this.selectedVoice) {
      console.log('Nenhuma mensagem de chat ou voz selecionada.');
      return;
    }
    // Indica que o processo de geração de áudio começou
    this.isGeneratingAudio = true;
    if (!this.chatMessage) {
      this.openSnackBar('No chatMessage to generate audio from.');
      // Restaura o estado para permitir novas gerações de áudio
      this.isGeneratingAudio = false;
      return;
    }

    const openAIKey = gpt4.apiKey;
    const url = 'https://api.openai.com/v1/audio/speech';
    const body = {
      model: 'tts-1', //tts-1-hd, tts-1
      //voice: this.getRandomVoice(),
      voice: this.selectedVoice,
      input: this.chatMessage
    };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${openAIKey}`
    });

    this.http.post(url, body, { headers, responseType: 'blob' }).subscribe(
      (response) => {
        const audioBlob = new Blob([response], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Define as funções listener que serão usadas nos eventos 'ready' e 'finish'
        const onReady = () => {
          this.waveform.play();
        };

        const onFinish = () => {
          // Ações adicionais após a conclusão do áudio
          this.isGeneratingAudio = false;
          this.playSound('../../../../assets/audio/toc.wav');
          this.openDialogSpeach(this.chatMessage);
          // Limpa os listeners após seu uso
          this.waveform.un('ready', onReady);
          this.waveform.un('finish', onFinish);
        };

        // Limpa quaisquer listeners anteriores (necessário se a função for chamada múltiplas vezes)
        this.waveform.un('ready', onReady);
        this.waveform.un('finish', onFinish);

        // Carrega o áudio no WaveSurfer e define os listeners
        this.waveform.load(audioUrl);
        this.waveform.on('ready', onReady);
        this.waveform.on('finish', onFinish);
        this.generateImageFromOpenAI(this.chatMessage); // TODO: GERA IMAGME SE O TEXTO FOR SELECIONADO
      },
      (error) => {
        console.error('Error generating audio:', error);
        // Restaura o estado em caso de erro
        this.isGeneratingAudio = false;
      }
    );
  } //fim

  /* ==================Generate Image FromO penAI==================== */
  generateImageFromOpenAI(selectedText: string) {
    const openAIKey = gpt4.apiKey;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${openAIKey}`,
      'Content-Type': 'application/json'
    });
    const body = {
      model: 'dall-e-2', //"dall-e-3",
      prompt: selectedText,
      quality: 'standard',
      size: '1024x1024',
      n: 1
    };
    this.http
      .post<any>('https://api.openai.com/v1/images/generations', body, {
        headers
      })
      .subscribe({
        next: (response) => {
          this.generatedImageUrl = response.data[0].url; // Ajuste conforme necessário
        },
        error: (error) => {
          console.error('Erro ao gerar a imagem:', error);
        }
      });
  } //fim

  /* ==================DISPLAY WORD BY WORD AND SHOW IMAGE==================== */
  displayTextWordByWord(text: string): number {
    const words = text.split(' ');
    const displayElement = document.getElementById('textDisplay');
    if (!displayElement) return 0; // Se o elemento não existir, retorna 0.

    let i = 0;
    displayElement.textContent = ''; // Inicializa o conteúdo do displayElement como vazio.

    const wordDisplayInterval = 900; // Intervalo em milissegundos
    const totalTime = words.length * wordDisplayInterval;

    const intervalId = setInterval(() => {
      if (i < words.length) {
        displayElement.innerText += words[i] + ' ';
        i++;
      } else {
        clearInterval(intervalId);
        // Após exibir todas as palavras, limpa o texto e insere a imagem.
        //displayElement.innerHTML = '<img src="/assets/img/logo/priming.png" alt="Priming Logo" style="max-width: 100%; height: auto;">';
        this.imageDisplayed = true; // Imagem exibida, atualize a flag
      }
    }, wordDisplayInterval);

    return totalTime;
  } //fim

  /* ==================VOLUME==================== */
  onVolumeChange(event: Event): void {
    const slider = event.target as HTMLInputElement;
    const newVolume = Number(slider.value);
    if (!isNaN(newVolume)) {
      const normalizedVolume = newVolume / 100;
      this.waveform.setVolume(normalizedVolume);
      this.cdRef.detectChanges();
      this.openSnackBar('Update volume WaveSurfer.' + normalizedVolume);
    }
  } //fim

  /* ==================VELOCIDADE==================== */
  onSpeedChange(event: Event): void {
    const slider = event.target as HTMLInputElement;
    const newSpeed = Number(slider.value) / 100;
    if (this.waveform && !isNaN(newSpeed)) {
      this.waveform.setPlaybackRate(newSpeed);
      this.openSnackBar('Speed Change.' + newSpeed);
    }
  } //fim

  /* ==================updatePlaybackHint==================== */
  updatePlaybackHint(currentTime: number) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
      hintElement.textContent = `Tempo: ${formattedTime}`;
      hintElement.style.display = 'block';
    }
  } //fim

  /* ==================Hide Playback Hint==================== */
  hidePlaybackHint() {
    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
      hintElement.style.display = 'none';
    }
  } //fim

  /* ==================Select Voice==================== */
  selectVoice(voice: string): void {
    this.voiceSelection = voice;
    this.selectedVoice = voice; // Ajuste conforme necessário.
    this.openSnackBar(`Voice selected: ${voice}`); // Para depuração
  } //fim

  /* ==================Perform Analysis==================== */
  performAnalysis(): void {
    // Atualiza textNLP com o valor de chatMessage
    this.textNLP = this.chatMessage;
    // Agora chama analyzeText para processar o texto
    this.analyzeText();
  } //fim

  /* ==================Analyz eText==================== */
  analyzeText() {
    const doc = nlp(this.chatMessage);
    // Análise básica
    this.pronouns = doc.pronouns().out('array');
    this.verbs = doc.verbs().out('array');
    this.nouns = doc.nouns().out('array');
    this.adjectives = doc.adjectives().out('array');
    this.adverbs = doc.adverbs().out('array');
    this.people = doc.people().out('array');
    this.places = doc.places().out('array');
    this.organizations = doc.organizations().out('array');
    this.clauses = doc.clauses().out('array'); // Cláusulas
    this.questions = doc.questions().out('array'); // Perguntas
    this.acronyms = doc.acronyms().out('array'); // Siglas
    this.emails = doc.emails().out('array'); // E-mails
    this.urls = doc.urls().out('array'); // URLs
  } //fim

  /* ==================Increase Speed==================== */
  increaseSpeed(): void {
    this.speed = Math.min(this.speed + 0.1, 4); // Limita a velocidade máxima a 2x
    this.applySpeed();
  } //fim

  /* ==================decreaseSpeed Speed==================== */
  decreaseSpeed(): void {
    this.speed = Math.max(this.speed - 0.1, 0.5); // Limita a velocidade mínima a 0.5x
    this.applySpeed();
  } //fim

  /* ==================Apply Speed==================== */
  applySpeed(): void {
    if (this.waveform) {
      this.waveform.setPlaybackRate(this.speed);
    }
  }
} //fim

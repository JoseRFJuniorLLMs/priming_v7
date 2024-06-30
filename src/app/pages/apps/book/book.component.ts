import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import ePub from 'epubjs';
import WaveSurfer from 'wavesurfer.js';
import gpt4 from '../../../../../gpt4.json';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
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
    MatExpansionModule
  ]
})
export class BookComponent implements OnInit, AfterViewInit {
  splitIntoSentences(text: string): string[] {
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  }
  ebooks: Ebook[] = [];
  panelOpenState = false;

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private isGeneratingAudio: boolean = false;
  public isPlaying: boolean = false;
  public currentPageText: string = '';

  book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;
  durationInSeconds = 130;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  isLoading = false;
  chatMessage: any;
  errorText = '';
  imageDisplayed: boolean = false;
  wordDuration: number = 0;
  wordsArray: string[] = [];
  selectedLayoutOption = 'continuous';

  //voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  voices: string[] = ['shimmer'];
  files: any[] = [];

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  /* ==================NG On Init==================== */
  ngOnInit() {
    const initialEbookPath = '../../assets/epub/Alice.epub';
    this.initializeBook(initialEbookPath);
    this.loadEbooks();
    window.addEventListener('resize', this.resizeListener);
  }

  /* ==================Process Current Page Audio==================== */
  public async processCurrentPageAudio(): Promise<void> {
    const currentPageTextArray = await this.captureCurrentPageText();
    this.generateAudio(currentPageTextArray);
  }

  /* ==================Process Current Page Audio Pause==================== */
  public pauseAudio(): void {
    if (this.waveform.isPlaying()) {
      this.waveform.pause();
    }
  }

  /* ==================NG On Destroy==================== */
  ngOnDestroy(): void {
    // Limpando o listener de eventos ao destruir o componente
    window.removeEventListener('resize', this.resizeListener);
  }

  /* ==================Resize Listener==================== */
  private resizeListener = (): void => {
    if (this.rendition) {
      this.rendition.resize(window.innerWidth, window.innerHeight);
    }
  };

  /* ==================Load Ebooks==================== */
  loadEbooks() {
    this.http
      .get<Ebook[]>('../../assets/epub/ebooks.json')
      .subscribe((data) => {
        this.ebooks = data;
      });
  }

  /* ==================initialize Book==================== */
  async initializeBook(filePath: string) {
    try {
      this.book = ePub(filePath);
      await this.book.ready;
      this.rendition = this.book.renderTo('area-de-exibicao', {
        width: window.innerWidth,
        height: window.innerHeight,
        spread: 'none' //none, auto, e always
      });
      this.rendition.flow('scrolled-doc');
      await this.book.locations.generate(1024);
      this.totalPages = this.book.locations.length();
      this.rendition.display().then(() => {
        this.updateCurrentPageTextAndLocation();
        // Após exibir o livro, captura o texto da página atual e gera áudio
        this.captureCurrentPageText().then((sentences) => {
          // Aqui você pode exibir as sentenças na tela, se necessário
          // Chama a função para gerar áudio com as sentenças capturadas
          this.generateAudio(sentences);
        });
      });
      this.rendition.on('relocated', (location: any) => {
        this.updateCurrentPageTextAndLocation();
        // Sempre que a página muda, captura o novo texto da página e gera áudio
        this.captureCurrentPageText().then((sentences) => {
          // Chama a função para gerar áudio com as sentenças capturadas
          this.generateAudio(sentences);
        });
      });
    } catch (error) {
      console.error('Error loading or rendering book: ', error);
    }
  }

  /* ==================Select Ebook==================== */
  async selectEbook(ebook: Ebook) {
    // Limpa a área de exibição
    const displayArea = document.getElementById('area-de-exibicao');
    if (displayArea) {
      displayArea.innerHTML = ''; // Remove o conteúdo anterior
    }
    // Inicializa o ePub com o caminho do arquivo do ebook selecionado
    try {
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
    } catch (error) {
      console.error('Erro ao carregar ou renderizar o livro: ', error);
    }
  }

  /* ==================Update Current Page==================== */
  updateCurrentPage() {
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      const pageIndex = this.book.locations.locationFromCfi(
        currentLocation.start.cfi
      );
      this.currentPage = pageIndex + 1;
      console.log(`Current page: ${this.currentPage} / ${this.totalPages}`);
      //this.openSnackBar(`Current page: ${this.currentPage} / ${this.totalPages}`);
    } else {
      console.log('Não foi possível determinar a localização atual.');
    }
  }

  /* ==================Capture Current PageText Frases==================== */
  public async captureCurrentPageText() {
    let currentPageText = '';

    // Primeiro, tenta selecionar especificamente o iframe dentro do elemento 'area-de-exibicao'
    const displayArea = document.getElementById('area-de-exibicao');
    const iframe = displayArea ? displayArea.querySelector('iframe') : null;

    // Se um iframe foi encontrado, tenta acessar seu conteúdo document; senão, usa o document global como fallback
    const contentDocument = iframe
      ? iframe.contentDocument || iframe.contentWindow?.document
      : null;

    if (contentDocument && contentDocument.body) {
      // Captura todo o texto dentro do elemento identificado
      currentPageText = contentDocument.body.innerText || '';
    } else {
      console.error(
        'Não foi possível acessar o conteúdo do iframe ou do documento.'
      );
      return [];
    }

    // Quebra o texto em frases, considerando diferentes terminações
    const sentences = currentPageText
      .trim()
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    console.log('Texto da página atual dividido em frases:', sentences);

    return sentences;
  }

  /* ==================Get Current Page Text==================== */
  public async getCurrentPageText(): Promise<void> {
    if (!this.rendition) {
      console.error('A renderização (rendition) não está disponível.');
      this.openSnackBar('A renderização (rendition) não está disponível.');
      return;
    }

    try {
      // Tentativa de focar apenas no conteúdo visível
      let visibleContentText = '';
      const visibleContents = this.rendition.getContents(); // Assumindo que isso retorna todos os conteúdos carregados

      // Idealmente, filtrar os conteúdos visíveis baseando-se em algum critério ou estado (isso pode precisar de ajuste)
      visibleContents.forEach(
        (content: { document: any; contentDocument: any }) => {
          // Acessando diretamente o DOM do conteúdo
          const doc = content.document || content.contentDocument;
          if (doc && doc.body) {
            // Aqui, você poderia tentar aplicar alguma lógica para determinar se o conteúdo é realmente visível
            // Esta é uma simplificação; a lógica real pode precisar ser mais complexa
            visibleContentText += doc.body.innerText || '';
          }
        }
      );

      this.currentPageText = visibleContentText.trim();
      //console.log('Texto da página atual:', this.currentPageText);
      this.captureCurrentPageText(); //CHAMADA PARA TESTAR O TEXTO CORRENTE
    } catch (error) {
      console.error('Erro ao tentar obter o texto da página atual:', error);
    }
  }

  /* ==================Update And Generate Audio==================== */
  async updateAndGenerateAudio() {
    // Chamada para atualizar o texto da página atual diretamente.
    await this.getCurrentPageText();

    // Verifica a propriedade 'currentPageText' diretamente após a atualização.
    console.log(
      'Texto atualizado para geração de áudio:',
      this.currentPageText
    );

    if (this.currentPageText) {
      // Divide a string em frases
      const currentPageTextArray = this.currentPageText.trim().split('. ');
      // Verifica se há frases antes de chamar generateAudio
      if (currentPageTextArray.length > 0) {
        this.generateAudio(currentPageTextArray);
      } else {
        console.log('Nenhum texto disponível para gerar áudio.');
      }
    } else {
      console.log('Nenhum texto disponível para gerar áudio.');
    }
  }

  //toggleLayout
  toggleLayout() {
    return () => {
      this.rendition.spread =
        this.rendition.spread === 'none' ? 'always' : 'none';
      this.rendition.display();
    };
  }

  nextPage() {
    this.rendition.next();
  }

  prevPage() {
    this.rendition.prev();
  }

  zoomIn() {
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
    this.rendition.themes.fontSize('100%');
  }

  clearSelection() {
    this.selectedText = '';
  }

  copySelectedText() {
    this.openSnackBar('copySelectedText');
    navigator.clipboard.writeText(this.selectedText);
  }
  /* ==================Count Pages==================== */
  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    this.openSnackBar('countPages:' + numberOfPages);
    return numberOfPages;
  }

  /* ==================Get CurrentPage==================== */
  getCurrentPage(): number {
    const currentPageIndex =
      this.book &&
      this.book.navigation &&
      this.book.navigation.indexOf(this.book.currentLocation);
    this.openSnackBar('countPages:' + currentPageIndex + 1);
    return currentPageIndex + 1;
  }

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch (option) {
      case 'default':
        this.openSnackBar('Default');
        // Possivelmente, manter padrões ou aplicar configurações específicas
        break;
      case 'continuous':
        this.openSnackBar('Continuous');
        flowValue = 'scrolled-doc'; // ou 'scrolled' dependendo da versão do epub.js
        break;
      case 'paginated':
        this.openSnackBar('Paginated');
        flowValue = 'paginated';
        width = '900px';
        height = '600px';
        break;
      case 'auto':
        this.openSnackBar('Auto');
        // Definir lógica para 'auto', se aplicável
        break;
    }

    if (flowValue) {
      this.rendition.flow(flowValue);
    }

    if (width && height) {
      this.openSnackBar('height');
      this.rendition.resize(width, height);
    }

    // Re-renderizar o conteúdo no ponto atual
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation) {
      this.rendition.display(currentLocation.start.cfi);
    }
  }

  /* ==================updateCurrentPageTextAndLocation==================== */
  async updateCurrentPageTextAndLocation() {
    // Simplesmente chama getCurrentPageText para atualizar o texto da página atual.
    await this.getCurrentPageText();
    //console.log("Texto da página atual:", this.currentPageText);

    // Atualiza a localização atual (número da página e total de páginas)
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      // Encontrar o índice do CFI atual nas localizações geradas
      const pageIndex = this.book.locations.locationFromCfi(
        currentLocation.start.cfi
      );
      if (pageIndex !== undefined) {
        this.currentPage = pageIndex + 1; // ePub.js pode usar índices base 0, então adicione 1 para ter base 1
        console.log(`Página atual: ${this.currentPage} / ${this.totalPages}`);
        //this.openSnackBar(`Página atual: ${this.currentPage} / ${this.totalPages}`);
      } else {
        console.log('CFI atual não encontrado nas localizações.');
      }
    } else {
      console.log('Não foi possível determinar a localização atual.');
    }
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100
    });
  }

  public async generateAudio(sentences: string[]) {
    // Calcula o número total de grupos de três frases
    const totalGroups = Math.ceil(sentences.length / 3);

    for (let i = 0; i < totalGroups; i++) {
      // Extrai as três próximas frases do array
      const group = sentences.slice(i * 3, (i + 1) * 3);

      // Junta as três frases em uma única string, separadas por um espaço
      const groupText = group.join(' ');

      // Gera o áudio para o grupo de frases
      await this.generateAndPlayAudio(groupText);

      // Se for o último grupo, chama a mudança para a próxima página
      if (i === totalGroups - 1) {
        this.changeToNextPage();
      }
    }
  }

  async changeToNextPage() {
    // Avança para a próxima página
    this.nextPage(); // Certifique-se de que isso atualiza a visualização corretamente
    console.log('Mudou para a próxima página');

    try {
      // Espera a captura das novas frases da próxima página
      const sentences = await this.captureCurrentPageText();
      if (sentences.length > 0) {
        // Chama generateAudio com as novas frases
        this.generateAudio(sentences);
      } else {
        console.log('Nenhuma frase encontrada na próxima página.');
      }
    } catch (error) {
      console.error('Erro ao capturar texto da próxima página:', error);
    }
  }

  private async generateAndPlayAudio(sentence: string): Promise<void> {
    // Verifica se a frase foi fornecida
    if (!sentence) {
      console.error('No text provided to generate audio from.');
      return;
    }

    // Faz a requisição para gerar o áudio como antes
    // Simulando uma chamada de API com uma Promise
    await new Promise<void>((resolve, reject) => {
      const openAIKey = gpt4.apiKey;
      const url = 'https://api.openai.com/v1/audio/speech';
      const body = JSON.stringify({
        model: 'tts-1-hd',
        voice: 'shimmer', //this.getRandomVoice(),
        input: sentence
      });
      const headers = new HttpHeaders({
        Authorization: `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      });

      this.http.post(url, body, { headers, responseType: 'blob' }).subscribe(
        (response) => {
          const audioBlob = new Blob([response], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Carrega o áudio no WaveSurfer
          this.waveform.load(audioUrl);

          // Configura um manipulador para resolver a Promise quando o áudio terminar de tocar
          this.waveform.on('ready', () => {
            this.waveform.play();
          });

          this.waveform.on('finish', () => {
            resolve(); // Resolve a Promise quando o áudio terminar de tocar
          });
        },
        (error) => {
          console.error('Error generating audio:', error);
          reject(error); // Rejeita a Promise em caso de erro
        }
      );
    });
  }

  ngAfterViewInit(): void {
    this.isPlaying = false;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      mediaControls: true, //controles
      height: 50,
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
      minPxPerSec: 50
    });

    // Configurações adicionais de volume e eventos de audioprocess
    this.waveform.setVolume(0.1); // 10/100
    this.waveform.on('audioprocess', (currentTime) =>
      this.updatePlaybackHint(currentTime)
    );

    // Eventos para gerenciar o estado de reprodução
    this.waveform.on('play', () => {
      this.isPlaying = true;
      this.changeDetectorRef.detectChanges(); // Atualiza a UI
      this.openSnackBar('Play');
    });

    this.waveform.on('pause', () => {
      this.isPlaying = false;
      this.changeDetectorRef.detectChanges(); // Atualiza a UI
      this.openSnackBar('Pause');
    });

    this.waveform.on('finish', () => {
      this.isPlaying = false;
      this.changeDetectorRef.detectChanges(); // Atualiza a UI
      this.hidePlaybackHint(); // Esconde a dica de reprodução
    });

    // Adiciona tratamento para evento de interação inicial, se necessário
    this.waveform.once('interaction', () => {
      this.waveform.play();
    });
  }

  /* ==================EVENTS WAVE FORM==================== */
  events() {
    this.waveform.once('interaction', () => {
      this.waveform.play();
    });

    this.waveform.on('play', () => {
      this.isPlaying = true;
      this.openSnackBar('Play');
    });

    this.waveform.on('pause', () => {
      this.isPlaying = false;
      this.openSnackBar('Pause');
    });
  }

  /* ==================UPDATE CURRENT TIME==================== */
  updatePlaybackHint(currentTime: number) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
      hintElement.textContent = `Tempo: ${formattedTime}`;
      hintElement.style.display = 'block';
    }
  }

  /* ==================UPDATE PLAY BACK HINT==================== */
  hidePlaybackHint() {
    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
      hintElement.style.display = 'none';
    }
  }

  /* ==================VOZ ALEATORIA==================== */
  getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.voices.length);
    //this.openSnackBar("Voz: " + this.voices[randomIndex]);
    return this.voices[randomIndex];
  }
} //fim

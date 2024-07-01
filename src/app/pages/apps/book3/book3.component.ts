import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import screenfull from 'screenfull';
import { Voice5RecognitionService } from './voice5-recognition.service';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { DatatextService } from './datatext.service';
import { TextItem } from './text-item.interface';
import WaveSurfer from 'wavesurfer.js';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogComponent } from './dialog.component';
import { MatDialog } from '@angular/material/dialog';

import nlp from 'compromise';
import { PdfService } from '../clase/pdf.service';
import { DialogZettelComponent } from '../clase/dialog.component';

@Component({
  selector: 'book3',
  templateUrl: './book3.component.html',
  styleUrls: ['./book3.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTooltipModule, DialogComponent]
})
export class Book3Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('textContainer') textContainer!: ElementRef;
  @ViewChild('mic') micElement!: ElementRef<HTMLDivElement>;
  @ViewChild('waveformPlay') waveformPlay!: ElementRef;
  @ViewChild('captionContainer') captionContainer!: ElementRef;

  texts: TextItem[] = [];
  filteredTexts: TextItem[] = [];
  currentText: TextItem | null = null;
  sentences: string[] = [];
  currentSentenceIndex: number = 0;
  currentWordIndex: number = 0;
  previousSentenceElement: HTMLElement | null = null;
  previousWordElement: HTMLElement | null = null;
  isReading: boolean = false;
  isFocusMode: boolean = false;
  isBeeLineActive: boolean = false;

  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;

  collapsedOpen$ = this.layoutService.sidenavCollapsedOpen$;

  page: number = 0;
  pageSize: number = 100;
  showTable: boolean = true;
  textSize: number = 16;
  selectedFont: string = 'Calibri';
  fonts: string[] = [
    'Calibri', 'Sitka', 'Comic Sans', 'Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New',
    'Brush Script MT', 'Lucida Handwriting', 'Pacifico', 'Dancing Script', 'Great Vibes', 'Indie Flower', 
    'Shadows Into Light', 'Amatic SC', 'Caveat', 'Permanent Marker', 'Satisfy', 'Patrick Hand', 'Homemade Apple'
  ];
  currentSentence: string | null = null;
  showCaptions: boolean = false;
  isTextSizeMenuOpen: boolean = false;

  isDarkMode: boolean = false;
  isDyslexicMode: boolean = false;

  totalCorrect: number = 0;
  totalErrors: number = 0;
  wordsToTrain: string[] = [];
  uniqueLevels: string[] = [];

  sortColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  selectedLevel: string = '';

  // NLP - Manipulação de Texto
  textNLP: string = '';
  pronouns: string[] = [];
  verbs: string[] = [];
  nouns: string[] = [];
  adjectives: string[] = [];
  adverbs: string[] = [];
  people: string[] = [];
  places: string[] = [];
  organizations: string[] = [];
  dates: string[] = [];
  values: string[] = [];
  phrases: string[] = [];
  clauses: string[] = [];
  negations: string[] = [];
  questions: string[] = [];
  quotes: string[] = [];
  acronyms: string[] = [];
  emails: string[] = [];
  urls: string[] = [];
  emojis: string[] = [];
  mentions: string[] = [];
  hashtags: string[] = [];

  nlpResults: any;

  isDialogOpen: boolean = false; 

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public voiceRecognitionService: Voice5RecognitionService,
    private soundService: SoundService,
    public pdfLoaderService: PdfService,
    private layoutService: VexLayoutService,
    private datatextService: DatatextService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.voiceRecognitionService.recordingEnded$.subscribe(url => {
      this.createWaveSurferPlay(url);
      this.openResultDialog();
    });
  
    this.voiceRecognitionService.spokenText$.subscribe(spokenText => {
      this.compareText(spokenText);
    });
  
    this.loadTextsByPage();
    this.loadVoices();
    this.loadUniqueLevels();
  }
  

  loadUniqueLevels(): void {
    this.datatextService.getUniqueLevels().subscribe((levels: string[]) => {
      this.uniqueLevels = levels;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit() {
    if (screenfull.isEnabled) {
      this.layoutService.collapseSidenav();
      screenfull.request().catch(err => {
        console.warn('Error attempting to enable full-screen mode:', err);
      });
    }
  
    this.voiceRecognitionService.setupWaveSurfer(this.micElement);
  
    setTimeout(() => {
      this.layoutService.collapseSidenav();
      this.changeDetectorRef.detectChanges();
    });
  
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  handleMouseUp() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.confirmCopyText();
    }
  }
  
    
  loadTextsByPage(): void {
    if (this.selectedLevel) {
      this.datatextService.getFilteredTextsByPage(this.page, this.pageSize, this.selectedLevel).subscribe((texts: TextItem[]) => {
        this.texts = texts;
        this.filteredTexts = this.texts;
        this.changeDetectorRef.detectChanges();
      });
    } else {
      this.datatextService.getTextsByPage(this.page, this.pageSize).subscribe((texts: TextItem[]) => {
        this.texts = texts;
        this.filteredTexts = this.texts;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  filterByLevel(event: Event): void {
    this.selectedLevel = (event.target as HTMLSelectElement).value;
    this.page = 0;
    this.loadTextsByPage();
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    this.filteredTexts.sort((a, b) => {
      const aValue = a[column as keyof TextItem];
      const bValue = b[column as keyof TextItem];

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  loadTextByIndex(index: number): void {
    const globalIndex = this.page * this.pageSize + index;
    this.datatextService.getTextByIndex(globalIndex).subscribe((textItem: TextItem | null) => {
      if (textItem) {
        this.currentText = textItem;
        this.sentences = this.splitIntoSentences(textItem.text);
        this.currentSentenceIndex = 0;
        this.processText();
        this.showTable = false;
        this.startReading();
        this.toggleCaptions();
        this.soundService.playOn();

        this.textNLP = textItem.text;
        this.analyzeText();

      } else {
        this.soundService.playErro();
      }
    });
  }

  splitIntoSentences(text: string): string[] {
    const cleanText = text.replace(/\n+/g, ' ');
    const sentences = cleanText.match(/[^.!?;,]+[.!?;,]+|[^.!?;,]+/g) || [];
    return sentences.map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
  }

  processText() {
    let processedText = '';

    this.sentences.forEach((sentence, index) => {
      const colorClass = `sentence-${index % 3}`;
      processedText += `<span class="${colorClass}" id="sentence-${index}" style="font-size: ${this.textSize}px; font-family: ${this.selectedFont};">${this.highlightWords(sentence.trim(), index)}</span> `;
    });

    this.textContainer.nativeElement.innerHTML = processedText.trim();
  }

  highlightWords(sentence: string, sentenceIndex: number): string {
    const words = sentence.split(' ');
    return words.map((word, wordIndex) => `<span class="word" id="sentence-${sentenceIndex}-word-${wordIndex}" style="font-size: ${this.textSize}px; font-family: ${this.selectedFont};">${word}</span>`).join(' ');
  }

  readNextSentence() {
    if (this.currentSentenceIndex < this.sentences.length) {
      const sentenceElement = this.textContainer.nativeElement.querySelector(`#sentence-${this.currentSentenceIndex}`);
      this.highlightSentence(sentenceElement);

      const currentSentenceText = this.sentences[this.currentSentenceIndex];
      const utterance = new SpeechSynthesisUtterance(currentSentenceText);
      utterance.lang = 'en-US';

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      this.currentSentence = currentSentenceText;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          this.highlightWord(event.charIndex);
        }
      };

      utterance.onend = () => {
        this.removeHighlight(this.previousSentenceElement);
        this.previousSentenceElement = sentenceElement as HTMLElement;
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentences.length) {
          setTimeout(() => this.readNextSentence(), 500);
        } else {
          this.isReading = false;
          this.currentSentence = null;
          this.openResultDialog();
        }
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        this.isReading = false;
      }
    } else {
      console.log('No more sentences to read.');
    }
  }

  highlightSentence(element: HTMLElement | null) {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.backgroundColor = 'rgba(253, 95, 95, 0.2)';
      element.style.color = 'black';
      element.classList.add('current-sentence');
      this.updateFocusHighlight(element);
    }
  }

  highlightWord(charIndex: number) {
    const sentence = this.sentences[this.currentSentenceIndex];
    const words = sentence.split(' ');
    let currentCharIndex = 0;
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      currentCharIndex += word.length + 1;
      if (currentCharIndex > charIndex) {
        const wordElement = this.textContainer.nativeElement.querySelector(`#sentence-${this.currentSentenceIndex}-word-${wordIndex}`);
        this.highlightWordElement(wordElement);
        this.updateCaptionHighlight(wordIndex);
        break;
      }
    }
  }

  highlightWordElement(element: HTMLElement | null) {
    if (element) {
      if (this.previousWordElement) {
        this.previousWordElement.style.backgroundColor = '';
      }
      element.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
      this.previousWordElement = element;
    }
  }

  updateCaptionHighlight(wordIndex: number) {
    if (this.captionContainer && this.showCaptions) {
      const sentence = this.sentences[this.currentSentenceIndex];
      const words = sentence.split(' ');
      const highlightedWords = words.map((word, index) => {
        if (index === wordIndex) {
          return `<span style="background-color: rgba(255, 165, 0, 0.2);">${word}</span>`;
        } else {
          return word;
        }
      }).join(' ');
      this.captionContainer.nativeElement.innerHTML = highlightedWords;
    }
  }

  removeHighlight(element: HTMLElement | null) {
    if (element) {
      element.style.backgroundColor = '';
      element.classList.remove('current-sentence');
    }
  }

  updateFocusHighlight(element: HTMLElement) {
    const focusHighlight = document.getElementById('focus-highlight');
    if (focusHighlight) {
      const rect = element.getBoundingClientRect();
      focusHighlight.style.top = `${rect.top}px`;
    }
  }

  toggleReading() {
    if (this.isReading) {
      this.stopReading();
    } else {
      this.startReading();
    }
  }

  startReading() {
    if (!this.isReading && this.sentences.length > 0) {
      this.isReading = true;
      this.readNextSentence();
    }
  }

  stopReading() {
    if (this.isReading) {
      this.isReading = false;
      speechSynthesis.cancel();
      this.openResultDialog();
    }
  }

  compareText(spokenText: string) {
    if (this.currentSentence) {
      const spokenWords = spokenText.trim().split(' ');
      const sentenceWords = this.currentSentence.trim().split(' ');
      let correctCount = 0;
      let errorCount = 0;
      const wordsToTrain = [];

      for (let i = 0; i < sentenceWords.length; i++) {
        if (spokenWords[i] && spokenWords[i].toLowerCase() === sentenceWords[i].toLowerCase()) {
          correctCount++;
        } else {
          errorCount++;
          if (sentenceWords[i]) {
            wordsToTrain.push(sentenceWords[i]);
          }
        }
      }

      this.totalCorrect += correctCount;
      this.totalErrors += errorCount;
      this.wordsToTrain.push(...wordsToTrain);
    }
  }

  createWaveSurferPlay(url: string): void {
    if (!this.waveformPlay || !this.waveformPlay.nativeElement) {
      return;
    }

    const wavesurferPlay = WaveSurfer.create({
      container: this.waveformPlay.nativeElement,
      waveColor: 'black',
      progressColor: 'gray',
      barWidth: 1,
      cursorWidth: 1,
      height: 1,
      barGap: 1,
      backend: 'WebAudio',
    });

    wavesurferPlay.load(url);
  }

  toggleRecording(): void {
    if (this.voiceRecognitionService.isRecording) {
      this.voiceRecognitionService.stopRecording();
    } else {
      this.voiceRecognitionService.startRecording();
    }
  }

  finalizeReading(): void {
    this.openResultDialog();
  }

  startVoiceCommand(): void {
    this.voiceRecognitionService.startListening();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  
    if (this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
    this.voiceRecognitionService.stopListening();
    this.voiceRecognitionService.stopRecording();
    this.soundService.playErro();
  }
  
  selectText(index: number): void {
    const globalIndex = this.page * this.pageSize + index;
    this.loadTextByIndex(globalIndex);
  }

  nextPage(): void {
    this.page++;
    this.loadTextsByPage();
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadTextsByPage();
    }
  }

  goBackToList(): void {
    this.showTable = true;
    this.currentText = null;
    this.textContainer.nativeElement.innerHTML = '';
  }

  onVoiceChange(event: Event): void {
    const selectedVoiceName = (event.target as HTMLSelectElement).value;
    this.selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName) || null;
  }

  openTextSizeMenu(): void {
    const textSizeMenu = document.getElementById('text-size-menu');
    if (textSizeMenu) {
      textSizeMenu.classList.add('show-menu');
    }
  }

  closeTextSizeMenu(): void {
    const textSizeMenu = document.getElementById('text-size-menu');
    if (textSizeMenu) {
      textSizeMenu.classList.remove('show-menu');
    }
  }

  increaseTextSize(): void {
    this.textSize += 2;
    this.processText();
  }

  decreaseTextSize(): void {
    if (this.textSize > 10) {
      this.textSize -= 2;
      this.processText();
    }
  }

  changeFont(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.selectedFont = target.value;
      this.processText();
    }
  }
  
  toggleCaptions(): void {
    this.showCaptions = !this.showCaptions;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const textContainer = this.textContainer.nativeElement;
    const captionContainer = this.captionContainer?.nativeElement;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      textContainer.style.backgroundColor = '#333333';
      textContainer.style.color = '#ffffff';
      if (captionContainer) {
        captionContainer.style.backgroundColor = '#333333';
        captionContainer.style.color = '#ffffff';
      }
      this.updateHighlights('dark');
    } else {
      document.body.classList.remove('dark-mode');
      textContainer.style.backgroundColor = '';
      textContainer.style.color = '';
      if (captionContainer) {
        captionContainer.style.backgroundColor = '';
        captionContainer.style.color = '';
      }
      this.updateHighlights('light');
    }
  }

  updateHighlights(mode: 'dark' | 'light') {
    const sentences = this.textContainer.nativeElement.querySelectorAll('.sentence-0, .sentence-1, .sentence-2');
    sentences.forEach((sentence: HTMLElement) => {
      if (mode === 'dark') {
        sentence.style.color = '#ffffff';
      } else {
        sentence.style.color = '';
      }
    });

    const words = this.textContainer.nativeElement.querySelectorAll('.word');
    words.forEach((word: HTMLElement) => {
      if (mode === 'dark') {
        word.style.color = '#ffffff';
      } else {
        word.style.color = '';
      }
    });
  }

  toggleDyslexicMode() {
    this.isDyslexicMode = !this.isDyslexicMode;
    const textContainer = this.textContainer.nativeElement;
    const captionContainer = this.captionContainer?.nativeElement;

    if (this.isDyslexicMode) {
      textContainer.classList.add('dyslexic-mode');
      if (captionContainer) {
        captionContainer.classList.add('dyslexic-mode');
      }
    } else {
      textContainer.classList.remove('dyslexic-mode');
      if (captionContainer) {
        captionContainer.classList.remove('dyslexic-mode');
      }
    }
  }

  loadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        this.sentences = this.splitIntoSentences(text);
        this.currentSentenceIndex = 0;
        this.processText();
        this.showTable = false;
        this.startReading();
      };
      reader.readAsText(file);
    }
  }

  openResultDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '100vw',
      height: '80vh',
      maxHeight: '100vh',
      data: {
        sentences: this.sentences,
        nlpResults: this.nlpResults
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  
  calculateTotalCorrect(): number {
    return this.totalCorrect;
  }

  calculateTotalErrors(): number {
    return this.totalErrors;
  }

  getWordsToTrain(): string[] {
    return this.wordsToTrain;
  }

  analyzeText() {
    const doc = nlp(this.textNLP);
    this.sentences = doc.sentences().out('array');
    
    this.nlpResults = this.sentences.map(sentence => {
      const sentenceDoc = nlp(sentence);
      return {
        pronouns: sentenceDoc.pronouns().out('array'),
        verbs: sentenceDoc.verbs().out('array'),
        nouns: sentenceDoc.nouns().out('array'),
        adjectives: sentenceDoc.adjectives().out('array'),
        adverbs: sentenceDoc.adverbs().out('array'),
        people: sentenceDoc.people().out('array'),
        places: sentenceDoc.places().out('array'),
        organizations: sentenceDoc.organizations().out('array'),
        dates: sentenceDoc.match('#Date').out('array'),
        values: sentenceDoc.match('#Value').out('array'),
        phrases: sentenceDoc.sentences().out('array'),
        clauses: sentenceDoc.clauses().out('array'),
        negations: sentenceDoc.match('#Negative').out('array'),
        questions: sentenceDoc.match('?').out('array'),
        quotes: sentenceDoc.match('"').out('array'),
        acronyms: sentenceDoc.match('#Acronym').out('array'),
        emails: sentenceDoc.match('#Email').out('array'),
        urls: sentenceDoc.match('#Url').out('array'),
        emojis: sentenceDoc.match('#Emoji').out('array'),
        mentions: sentenceDoc.match('@').out('array'),
        hashtags: sentenceDoc.match('#Hashtag').out('array')
      };
    });
  }

/*   copySelectedText(): void {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      if (selectedText.length > 0) {
        navigator.clipboard.writeText(selectedText).then(() => {
        
          this.pdfLoaderService.openSnackBar('Text copied to clipboard!');
          this.voiceRecognitionService.speakSelectedText('Zettelkasten notes, now you can save the note to study:' + selectedText);
       
              
        }).catch(err => {
        });
      } 
    }
  } */

  confirmCopyText(): void {
    if (this.isDialogOpen) {
      return; // Evita abrir múltiplos diálogos
    }
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      if (selectedText.length > 0) {
        this.isDialogOpen = true; // Marca o diálogo como aberto
  
        this.pdfLoaderService.openSnackBar('Text copied to clipboard!');
        this.voiceRecognitionService.speakSelectedText('Zettelkasten notes, now you can save the note to study:' + selectedText);
  
        // Copia o texto para a área de transferência
        const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.value = selectedText;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
  
        // Abre o diálogo e passa o texto selecionado
        const dialogRef = this.dialog.open(DialogZettelComponent, {
          width: '600px',
          data: { text: selectedText }
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.isDialogOpen = false; // Marca o diálogo como fechado
        });
      }
    }
  }
  
  
  loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      this.voices = voices;
      this.changeDetectorRef.detectChanges();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
        this.changeDetectorRef.detectChanges();
      };
    }
  }
  
  applyBeeLineReader() {
    const textContainer = this.textContainer.nativeElement;
    const words = textContainer.innerText.split(' ');
    const colors = [
      [0, 0, 255],    // Azul
      [75, 0, 130],   // Índigo
      [255, 0, 0],    // Vermelho
      [0, 0, 0]       // Preto
    ];
    const totalWords = words.length;
    const gradientWords = 50; // Número de palavras por ciclo de degradê
    const colorStops = colors.length - 1;
    const wordsPerStop = Math.floor(gradientWords / colorStops);
  
    let gradientText = words.map((word: any, index: number) => {
      const stopIndex = Math.floor((index % gradientWords) / wordsPerStop);
      const t = ((index % gradientWords) % wordsPerStop) / wordsPerStop;
      const startColor = colors[stopIndex];
      const endColor = colors[(stopIndex + 1) % colors.length];
      const color = this.interpolateColor(startColor, endColor, t);
      return `<span style="color: rgb(${color.join(',')})">${word}</span>`;
    }).join(' ');
  
    textContainer.innerHTML = gradientText;
    this.isBeeLineActive = !this.isBeeLineActive;
  }
  
  interpolateColor(startColor: number[], endColor: number[], t: number): number[] {
    return startColor.map((start, i) => Math.round(start + (endColor[i] - start) * t));
  }
   
        
}//fim

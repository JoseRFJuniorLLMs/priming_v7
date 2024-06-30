import { Injectable, NgZone, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { SoundService } from '../../../../app/layouts/components/footer/sound.service';

@Injectable({
  providedIn: 'root'
})
export class Voice3RecognitionService {
  private recognition: any;
  public isListening: boolean = false;
  public command$ = new Subject<string>();

  public wavesurfer!: WaveSurfer;
  public recordPlugin!: any;
  public isRecording: boolean = false;
  public isPaused: boolean = false;
  public recordedUrl: string | undefined;
  public recordingEnded$ = new Subject<string>();

  private selectedVoice: SpeechSynthesisVoice | null = null;

  public combinations: Set<string> = new Set();
  public commandCounter: number = 0;
  public currentPhraseIndex: number = 0;
  public message: string = '';
  public whos = ['i', 'you', 'we', 'they', 'he', 'she', 'it', 'people', 'someone', 'everyone'];
  public whys = ['can', 'want', 'like', 'need', 'loves', 'hates', 'prefers', 'enjoy', 'has to', 'should'];
  public actions = ['go', 'see', 'eat', 'play', 'work', 'drive', 'stay', 'listen', 'study', 'visit'];
  public wheres = ['to the store', 'the movie', 'at the restaurant', 'in the park', 'at the office', 'to the city', 'at home', 'to music', 'in the library', 'the museum'];
  public currentCombinations: { who: string, why: string, action: string, where: string }[] = [];
  public pageSize: number = 9;

  constructor(
    private soundService: SoundService,
    private zone: NgZone
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition API não é suportada neste navegador.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB'; 
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      console.log('Reconhecimento de voz iniciado.');
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.trim().toLowerCase();
          this.command$.next(command);
        }
      });
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };

    this.setupVoice();
  }

  private setupVoice(): void {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      this.selectedVoice = voices.find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
    };

    if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = loadVoices;
    }

    setTimeout(() => {
      if (synth.getVoices().length > 0) {
        loadVoices();
      }
    }, 500);
  }

  public init(): void {}

  public startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  setupWaveSurfer(micElement: ElementRef<HTMLDivElement>): void {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }

    if (!micElement || !micElement.nativeElement) {
      console.error('micElement ainda não está disponível.');
      return;
    }

    try {
      this.wavesurfer = WaveSurfer.create({
        container: micElement.nativeElement,
        waveColor: 'rgb(33, 150, 243)',
        progressColor: 'rgb(135, 206, 235)',
        barGap: 1,
        barWidth: 2,
        barHeight: 10,
        barRadius: 50,
        backend: 'WebAudio'
      });

      this.recordPlugin = this.wavesurfer.registerPlugin(
        RecordPlugin.create({
          mimeType: 'audio/webm',
          scrollingWaveform: false,
          renderRecordedAudio: false
        })
      );

      this.recordPlugin.on('record-end', (blob: Blob) => {
        this.isRecording = false;
        this.recordedUrl = URL.createObjectURL(blob);
        this.recordingEnded$.next(this.recordedUrl);
      });

    } catch (error) {
      console.error('Erro ao inicializar o WaveSurfer:', error);
    }
  }

  startRecording(): void {
    if (!this.recordPlugin || !this.recordPlugin.isRecording()) {
      this.recordPlugin.startRecording();
      this.isRecording = true;
    } else {
      console.warn('Gravação já está em andamento.');
    }
  }

  stopRecording(): void {
    if (this.recordPlugin && this.recordPlugin.isRecording()) {
      this.recordPlugin.stopRecording();
      this.isRecording = false;
    } else {
      console.warn('Não há gravação em andamento para parar.');
    }
  }

  pauseRecording(): void {
    if (this.recordPlugin && this.isRecording) {
      if (!this.isPaused) {
        this.recordPlugin.pauseRecording();
        this.isPaused = true;
      } else {
        this.recordPlugin.resumeRecording();
        this.isPaused = false;
      }
    } else {
      console.warn('Não há gravação em andamento para pausar/retomar.');
    }
  }

  toggleRecording(): void {
    if (!this.recordPlugin) {
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  public speak(text: string): void {
    const synth = window.speechSynthesis;

    const speakText = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.voice = this.selectedVoice || synth.getVoices().find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
        synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = () => {
            this.setupVoice(); 
            speakText();
        };
    } else {
        speakText();
    }
  }

  public speakSelectedText(selectedText: string): void {
    const synth = window.speechSynthesis;

    const speakText = () => {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = 'en-GB';
      utterance.voice = this.selectedVoice || synth.getVoices().find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        this.setupVoice(); 
        speakText();
      };
    } else {
      speakText();
    }
  }

  public speakText(text: string): void {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.voice = this.selectedVoice || synth.getVoices().find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
    synth.speak(utterance);
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
        if (this.commandCounter === this.pageSize) {
          this.nextPage();
        }
      }

      if (this.currentPhraseIndex < this.currentCombinations.length - 1) {
        this.currentPhraseIndex++;
      } else {
        this.nextPage();
      }
      
      this.speakText(`${parsedCommand.who} ${parsedCommand.why} ${parsedCommand.action} ${parsedCommand.where}`);
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

  private nextPage(): void {
    // Implementar lógica para ir para a próxima página de combinações, se necessário.
  }
}

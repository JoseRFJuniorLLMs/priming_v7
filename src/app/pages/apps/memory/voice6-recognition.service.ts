import { ElementRef, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

@Injectable({
  providedIn: 'root'
})
export class Voice6RecognitionService {
  private recognition: any;
  public isListening: boolean = false;
  public command$ = new Subject<string>();
  public spokenText$ = new Subject<string>();
  public wavesurfer!: WaveSurfer;
  public recordPlugin: any;
  public isRecording: boolean = false;
  public isPaused: boolean = false;
  public recordedUrl: string | undefined;
  public recordingEnded$ = new Subject<string>();

  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(private zone: NgZone) {
    this.setupSpeechRecognition();
    this.setupVoice();
  }

  private setupSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API não é suportada neste navegador.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; 
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-GB';

    this.recognition.onstart = () => this.onRecognitionStart();
    this.recognition.onresult = (event: any) => this.onRecognitionResult(event);
    this.recognition.onend = () => this.onRecognitionEnd();
  }

  private onRecognitionStart(): void {
    this.isListening = true;
    console.log('Speech recognition started.');
  }

  private onRecognitionResult(event: any): void {
    this.zone.run(() => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.trim().toLowerCase();
        console.log('Recognized command:', command);
        this.command$.next(command);
        this.spokenText$.next(command);
        this.stopListening(); 
      }
    });
  }

  private onRecognitionEnd(): void {
    this.isListening = false;
    console.log('Speech recognition ended.');
  }

  public startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      console.log('Started listening.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Stopped listening.');
    }
  }

  public speak(text: string): void {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.voice = this.selectedVoice;
    synth.speak(utterance);
  }

  public setupWaveSurfer(micElement: ElementRef<HTMLDivElement>): void {
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
        barWidth: 1,
        barHeight: 1,
        barRadius: 1,
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
        this.onRecordEnd(blob);
      });

    } catch (error) {
      console.error('Erro ao inicializar o WaveSurfer:', error);
    }
  }

  private onRecordEnd(blob: Blob): void {
    this.isRecording = false;
    this.recordedUrl = URL.createObjectURL(blob);
    this.recordingEnded$.next(this.recordedUrl);
    console.log('Recording ended:', this.recordedUrl);
  }

  public startRecording(): void {
    if (!this.recordPlugin || this.recordPlugin.isRecording()) {
      console.warn('Gravação já está em andamento ou recordPlugin não está inicializado.');
      return;
    }

    try {
      this.recordPlugin.startRecording();
      this.isRecording = true;
      console.log('Started recording.');
    } catch (error) {
      console.error('Erro ao iniciar a gravação:', error);
    }
  }

  public stopRecording(): void {
    if (this.recordPlugin && this.recordPlugin.isRecording()) {
      this.recordPlugin.stopRecording();
      this.isRecording = false;
      console.log('Stopped recording.');
    } else {
      console.warn('Não há gravação em andamento para parar.');
    }
  }

  public pauseRecording(): void {
    if (this.recordPlugin && this.isRecording) {
      if (!this.isPaused) {
        this.recordPlugin.pauseRecording();
        this.isPaused = true;
        console.log('Paused recording.');
      } else {
        this.recordPlugin.resumeRecording();
        this.isPaused = false;
        console.log('Resumed recording.');
      }
    } else {
      console.warn('Não há gravação em andamento para pausar/retomar.');
    }
  }

  public toggleRecording(): void {
    if (!this.recordPlugin) {
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
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
  
}

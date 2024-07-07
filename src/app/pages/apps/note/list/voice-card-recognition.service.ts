import { Injectable, NgZone, ElementRef, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { SoundService } from '../../../../layouts/components/footer/sound.service';

@Injectable({
  providedIn: 'root'
})
export class VoiceCardRecognitionService implements OnInit {
  private recognition: any;
  public isListening: boolean = false;
  public command$ = new Subject<string>();

  public wavesurfer!: WaveSurfer;
  public recordPlugin!: any;
  public isRecording: boolean = false;
  public isPaused: boolean = false;
  public recordedUrl: string | undefined;
  public recordingEnded$ = new Subject<string>();

  public voices: SpeechSynthesisVoice[] = [];
  public selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(
    private soundService: SoundService,
    private zone: NgZone
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB';
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      console.log('Speech recognition started.');
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

    // Configuração da voz
    this.setupVoice();
  }

  ngOnInit() {
    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length > 0) {
      this.selectedVoice = this.voices.find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
    }
  }

  private setupVoice(): void {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      this.voices = synth.getVoices();
      this.selectedVoice = this.voices.find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
    };

    if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = loadVoices;
    }

    // Tentar carregar as vozes imediatamente, se possível
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
      console.error('micElement is not yet available.');
      return;
    }

    try {
      this.wavesurfer = WaveSurfer.create({
        container: micElement.nativeElement,
        waveColor: '#d3d3d3',
        //progressColor: 'rgb(0, 0, 0)',
        progressColor: 'transparent',
        barGap: 1,
        barWidth: 1,
        barHeight: 1,
        barRadius: 1,
        backend: 'WebAudio'
      });

      this.recordPlugin = this.wavesurfer.registerPlugin(
        RecordPlugin.create({
          mimeType: 'audio/webm'
        })
      );

      // Iniciar a gravação assim que o plugin estiver pronto
      this.recordPlugin.on('ready', () => {
        console.log('RecordPlugin is ready');
        this.startRecording();
      });

      // Processar o áudio gravado quando a gravação for finalizada
      this.recordPlugin.on('finish', (blob: Blob) => {
        this.isRecording = false;
        this.recordedUrl = URL.createObjectURL(blob);
        this.recordingEnded$.next(this.recordedUrl);
        // Carregar e visualizar o áudio gravado
        this.wavesurfer.load(this.recordedUrl);
      });

    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
    }
  }

  public startRecording(): void {
    if (!this.recordPlugin || !this.recordPlugin.isRecording) {
      console.warn('RecordPlugin is not available or not initialized properly.');
      return;
    }
    this.recordPlugin.startRecording();
    this.isRecording = true;
  }

  public stopRecording(): void {
    if (this.recordPlugin && this.recordPlugin.isRecording) {
      this.recordPlugin.stopRecording();
      this.isRecording = false;
    } else {
      console.warn('No recording in progress to stop.');
    }
  }

  public speak(text: string, selectedVoice: SpeechSynthesisVoice | null): void {
    const synth = window.speechSynthesis;

    const speakText = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.voice = selectedVoice || synth.getVoices().find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
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

  public speakAndVisualize(text: string, micElement: ElementRef<HTMLDivElement>, selectedVoice: SpeechSynthesisVoice | null): void {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = selectedVoice;

    utterance.onstart = () => {
      this.setupWaveSurfer(micElement);
      this.startRecording();
    };

    utterance.onend = () => {
      this.stopRecording();
    };

    synth.speak(utterance);
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

  public onVoiceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedVoiceName = selectElement.value;
    this.selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName) || null;
  }
}

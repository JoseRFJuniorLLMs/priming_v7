import { Injectable, NgZone, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class VoiceFoodRecognitionService implements AfterViewInit {
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

  @ViewChild('mic') micElement!: ElementRef<HTMLDivElement>;
  @ViewChild('micSelect') micSelectElement!: ElementRef<HTMLSelectElement>;
  @ViewChild('waveformPlay') waveformPlay!: ElementRef;

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

    this.setupVoice();
  }

  ngAfterViewInit(): void {
    this.init();
  }

  setupWaveSurfer(micElement: ElementRef<HTMLDivElement>): void {
    if (!micElement || !micElement.nativeElement) {
      console.error('micElement ainda não está disponível.');
      return;
    }

    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }

    try {
      this.wavesurfer = WaveSurfer.create({
        container: micElement.nativeElement,
        waveColor: 'rgb(33, 150, 243)',
        barGap: 1,
        barWidth: 15,
        barHeight: 4,
        barRadius: 30,
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

  init(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log('Permissão para microfone concedida.');
        if (this.micElement) {
          this.setupWaveSurfer(this.micElement);
          this.startRecording();
        }
      })
      .catch((error) => {
        console.error('Permissão para microfone negada:', error);
      });
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  startRecording(): void {
    if (!this.recordPlugin) {
      console.error('RecordPlugin is not initialized.');
      return;
    }

    if (!this.recordPlugin.isRecording()) {
      this.recordPlugin.startRecording();
      this.isRecording = true;
    } else {
      console.warn('Recording is already in progress.');
    }
  }

  stopRecording(): void {
    if (this.recordPlugin && this.recordPlugin.isRecording()) {
      this.recordPlugin.stopRecording();
      this.isRecording = false;
      this.wavesurfer.destroy();
    } else {
      console.warn('No recording in progress to stop.');
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
      console.warn('No recording in progress to pause/resume.');
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

  speak(text: string): void {
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

  speakSelectedText(selectedText: string): void {
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

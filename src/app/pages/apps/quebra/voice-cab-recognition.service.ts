import { ElementRef, EventEmitter, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

@Injectable({
  providedIn: 'root'
})
export class VoiceCabRecognitionService {

  public onResult: EventEmitter<string> = new EventEmitter<string>();
  public recognition: any;
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

  constructor(private zone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API não é suportada neste navegador.');
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-GB';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim().toLowerCase();
          this.command$.next(transcript);
          this.onResult.emit(transcript);
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

  setupVoice(): void {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      this.voices = synth.getVoices();
      this.selectedVoice = this.voices.find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;
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

  changeVoice(voiceName: string): void {
    this.selectedVoice = this.voices.find(voice => voice.name === voiceName) || null;
  }

  speak(text: string): void {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.voice = this.selectedVoice;
    synth.speak(utterance);
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
  handleResult() {
    this.onResult.emit();
  }
}

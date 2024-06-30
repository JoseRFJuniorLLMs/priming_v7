import { Injectable, NgZone, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { SoundService } from '../../../layouts/components/footer/sound.service';

@Injectable({
  providedIn: 'root'
})
export class Voice2RecognitionService {
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

  private setupVoice(): void {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      this.selectedVoice = voices.find(voice => voice.lang === 'en-GB' && /female|woman|girl/i.test(voice.name)) || null;

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
      console.error('Error initializing WaveSurfer:', error);
    }
  }

  startRecording(): void {
    if (!this.recordPlugin || !this.recordPlugin.isRecording()) {
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


}

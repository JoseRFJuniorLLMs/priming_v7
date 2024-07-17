import { ElementRef, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';

@Injectable({
  providedIn: 'root'
})
export class Voice5RecognitionService {
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

  private currentSpeechRate: number = 1;

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
    utterance.rate = this.currentSpeechRate;
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
  
  
  public increaseSpeechRate(): void {
    if (this.currentSpeechRate < 2) { // Limite máximo de 2x
        this.currentSpeechRate += 0.1; // Aumenta em 0.1
        this.setSpeechRate(this.currentSpeechRate);
    }
}

public decreaseSpeechRate(): void {
    if (this.currentSpeechRate > 0.5) { // Limite mínimo de 0.5x
        this.currentSpeechRate -= 0.1; // Diminui em 0.1
        this.setSpeechRate(this.currentSpeechRate);
    }
}

private setSpeechRate(rate: number): void {
    this.currentSpeechRate = rate;
}

public setSpeechRateFromSlider(value: number): void {
  this.currentSpeechRate = 0.5 + (value / 100) * 1.5;
}


  
}//fim

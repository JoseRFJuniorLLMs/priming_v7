import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Voice8RecognitionService {
  private recognition: any;
  public isListening: boolean = false;
  public command$ = new Subject<string>();
  public spokenText$ = new Subject<string>();

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

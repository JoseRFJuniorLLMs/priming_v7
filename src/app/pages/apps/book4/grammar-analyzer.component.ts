import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import nlp from 'compromise';

@Component({
  selector: 'app-grammar-analyzer',
  templateUrl: './grammar-analyzer.component.html',
  styleUrls: ['./grammar-analyzer.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule
  ]
})
export class GrammarAnalyzerComponent {
  @ViewChild('textContainer') textContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  text: string = '';
  fileName: string = '';
  isAnalyzed: boolean = false;

  pronouns: string[] = [];
  verbs: string[] = [];
  nouns: string[] = [];
  adjectives: string[] = [];
  adverbs: string[] = [];
  people: string[] = [];
  places: string[] = [];
  organizations: string[] = [];
  clauses: string[] = [];
  questions: string[] = [];
  acronyms: string[] = [];
  emails: string[] = [];
  urls: string[] = [];

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.text = e.target?.result as string;
        if (this.textContainer) {
          this.textContainer.nativeElement.innerText = this.text;
        }
        this.isAnalyzed = false;
      };
      reader.readAsText(file);
    }
  }

  performAnalysis(): void {
    this.analyzeText(this.text); // Usando a variável text
  }

  analyzeText(text: string): void {
    const doc = nlp(text);
    this.pronouns = doc.pronouns().out('array');
    this.verbs = doc.verbs().out('array');
    this.nouns = doc.nouns().out('array');
    this.adjectives = doc.adjectives().out('array');
    this.adverbs = doc.adverbs().out('array');
    this.people = doc.people().out('array');
    this.places = doc.places().out('array');
    this.organizations = doc.organizations().out('array');
    this.clauses = doc.clauses().out('array');
    this.questions = doc.questions().out('array');
    this.acronyms = doc.acronyms().out('array');
    this.emails = doc.emails().out('array');
    this.urls = doc.urls().out('array');
    this.isAnalyzed = true; // Marcar como analisado
  }

  resetAnalysis(): void {
    this.text = '';
    this.fileName = '';
    this.isAnalyzed = false;
    if (this.textContainer) {
      this.textContainer.nativeElement.innerHTML = '';
    }
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  public partsOfSpeech = {
    Noun: { color: '#9932CC', symbol: 'n.' },
    Verb: { color: '#FF4500', symbol: 'v.' },
    Adjective: { color: '#32CD32', symbol: 'adj.' },
    Adverb: { color: '#9932CC', symbol: 'adv.' },
    Determiner: { color: '#1E90FF', symbol: 'det.' },
    Preposition: { color: '#FFA500', symbol: 'prep.' },
    Conjunction: { color: '#FF69B4', symbol: 'conj.' },
    Pronoun: { color: '#20B2AA', symbol: 'pron.' },
    Other: { color: '#000000', symbol: '' }
  };
  
  public determineWordType(tags: string[]): string {
    if (tags.includes('Noun')) return 'Noun';
    if (tags.includes('Verb')) return 'Verb';
    if (tags.includes('Adjective')) return 'Adjective';
    if (tags.includes('Adverb')) return 'Adverb';
    if (tags.includes('Determiner')) return 'Determiner';
    if (tags.includes('Preposition')) return 'Preposition';
    if (tags.includes('Conjunction')) return 'Conjunction';
    if (tags.includes('Pronoun')) return 'Pronoun';
    return 'Other';
  }
  
}

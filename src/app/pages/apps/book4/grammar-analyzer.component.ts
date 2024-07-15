
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

  private partsOfSpeech = {
    Noun: { color: '#9932CC', symbol: 'n.' },
    Verb: { color: '#FF4500', symbol: 'v.' },
    Adjective: { color: '#32CD32', symbol: 'adj.' },
    Adverb: { color: '#FFA500', symbol: 'adv.' },
    Pronoun: { color: '#20B2AA', symbol: 'pron.' },
  };

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

  analyzeText(): void {
    if (this.textContainer) {
      const text = this.textContainer.nativeElement.innerText.trim();
      if (text) {
        this.applyPartsOfSpeech(text);
        this.isAnalyzed = true;
      } else {
        alert('Por favor, selecione um arquivo de texto primeiro.');
      }
    }
  }

  private applyPartsOfSpeech(text: string): void {
    const doc = nlp(text);
    const terms = doc.terms().out('array');
    const tagsArray = doc.terms().out('tags');

    this.resetWordCategories();

    terms.forEach((term: any, index: number) => {
      const tags = Array.isArray(tagsArray[index]) ? tagsArray[index] : [];
      const type = this.determineWordType(tags);
      
      if (type === 'Noun') this.nouns.push(term);
      else if (type === 'Verb') this.verbs.push(term);
      else if (type === 'Adjective') this.adjectives.push(term);
      else if (type === 'Adverb') this.adverbs.push(term);
      else if (type === 'Pronoun') this.pronouns.push(term);
    });

    this.textContainer.nativeElement.innerHTML = terms.join(' ');
  }

  private determineWordType(tags: string[]): string {
    if (tags.includes('Noun')) return 'Noun';
    if (tags.includes('Verb')) return 'Verb';
    if (tags.includes('Adjective')) return 'Adjective';
    if (tags.includes('Adverb')) return 'Adverb';
    if (tags.includes('Pronoun')) return 'Pronoun';
    return 'Other';
  }

  private resetWordCategories(): void {
    this.pronouns = [];
    this.verbs = [];
    this.nouns = [];
    this.adjectives = [];
    this.adverbs = [];
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
}

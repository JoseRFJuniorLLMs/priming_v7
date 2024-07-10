import { Injectable } from '@angular/core';
import nlp from 'compromise';

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  private partsOfSpeech = {
    Noun: { color: '#4169E1', symbol: 'n.' },
    Verb: { color: '#FF4500', symbol: 'v.' },
    Adjective: { color: '#32CD32', symbol: 'adj.' },
    Adverb: { color: '#9932CC', symbol: 'adv.' },
    Other: { color: 'inherit', symbol: '' }
  };

  applyPartsOfSpeech(textContainer: HTMLElement): void {
    console.log('applyPartsOfSpeech called');

    if (!textContainer) {
      console.error('Text container is null or undefined');
      return;
    }

    const text = textContainer.innerText.trim();
    if (!text) {
      console.warn('Text container is empty');
      return;
    }

    try {
      const doc = nlp(text);
      const words = text.split(/\s+/).map(word => this.classifyWord(word, doc));
      
      textContainer.innerHTML = words.map(word => this.createWordSpan(word)).join(' ');
      
      console.log('Parts of speech applied successfully');
    } catch (error) {
      console.error('Error applying parts of speech:', error);
    }
  }

  private classifyWord(word: string, doc: any): { text: string; type: string } {
    const match = doc.match(word);
    const terms = match.terms(0);
    const tags = terms ? terms.out('tags') : [];
    const type = this.determineWordType(tags);
    return { text: word, type };
  }

  private determineWordType(tags: string[]): string {
    if (tags.includes('Noun')) return 'Noun';
    if (tags.includes('Verb')) return 'Verb';
    if (tags.includes('Adjective')) return 'Adjective';
    if (tags.includes('Adverb')) return 'Adverb';
    return 'Other';
  }

  private createWordSpan(word: { text: string; type: string }): string {
    const { color, symbol } = this.partsOfSpeech[word.type as keyof typeof this.partsOfSpeech];
    return `<span class="word-container">
              <span class="grammar-symbol" style="color: ${color}">${symbol}</span>
              <span style="color: ${color}">${word.text}</span>
            </span>`;
  }

  clearPartsOfSpeech(textContainer: HTMLElement): void {
    if (textContainer) {
      textContainer.innerHTML = textContainer.innerText;
    }
  }
}

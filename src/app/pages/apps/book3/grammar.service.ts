import { Injectable } from '@angular/core';
import nlp from 'compromise';

@Injectable({
  providedIn: 'root'
})
export class GrammarService {
  private partsOfSpeech = {
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
        const terms = doc.terms().out('array');
        const tagsArray = doc.terms().out('tags');

        let htmlContent = '';
        terms.forEach((term: any, index: number) => {
            const tags = Array.isArray(tagsArray[index]) ? tagsArray[index] : [];
            const type = this.determineWordType(tags);
            const { color, symbol } = this.partsOfSpeech[type as keyof typeof this.partsOfSpeech];

            htmlContent += `
                <span style="display: inline-block; margin-right: 5px; text-align: center;">
                    <span style="display: block; font-size: 0.8em; color: ${color};">${symbol}</span>
                    <span style="display: block; color: ${color};">${term}</span>
                </span>
            `;
        });

        textContainer.innerHTML = htmlContent;
        console.log('Parts of speech applied successfully');
    } catch (error) {
        console.error('Error applying parts of speech:', error);
    }
}


  private determineWordType(tags: string[]): string {
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

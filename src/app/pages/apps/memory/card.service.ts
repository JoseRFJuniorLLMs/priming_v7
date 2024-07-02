import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cards = [
    { id: 1, image: 'assets/img/card/cat.png', word: 'Cat', type: 'image' },
    { id: 1, image: '', word: 'Cat', type: 'word' },
    { id: 2, image: 'assets/img/card/dog.png', word: 'Dog', type: 'image' },
    { id: 2, image: '', word: 'Dog', type: 'word' },
    // Adicionar outras cartas...
  ];

  getCards(count: number): any[] {
    let selectedCards = this.cards.slice(0, count * 2); // Double the count for pairs
    return this.shuffle([...selectedCards]);
  }

  shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cards = [
    { id: 1, image: 'assets/img/card/anion.png', word: 'Anion', type: 'image' },
    { id: 1, image: '', word: 'Anion', type: 'word' },
    { id: 2, image: 'assets/img/card/apple.png', word: 'Apple', type: 'image' },
    { id: 2, image: '', word: 'Apple', type: 'word' },
    { id: 3, image: 'assets/img/card/avocado.png', word: 'Avocado', type: 'image' },
    { id: 3, image: '', word: 'Avocado', type: 'word' },
    { id: 4, image: 'assets/img/card/beach.png', word: 'Beach', type: 'image' },
    { id: 4, image: '', word: 'Beach', type: 'word' },
    { id: 5, image: 'assets/img/card/birthday cake.png', word: 'Birthday Cake', type: 'image' },
    { id: 5, image: '', word: 'Birthday Cake', type: 'word' },
    { id: 6, image: 'assets/img/card/gloves.png', word: 'Gloves', type: 'image' },
    { id: 6, image: '', word: 'Gloves', type: 'word' },
    { id: 7, image: 'assets/img/card/grapes.png', word: 'Grapes', type: 'image' },
    { id: 7, image: '', word: 'Grapes', type: 'word' },
    { id: 8, image: 'assets/img/card/hamburger.png', word: 'Hamburger', type: 'image' },
    { id: 8, image: '', word: 'Hamburger', type: 'word' },
    { id: 9, image: 'assets/img/card/hotdog.png', word: 'Hotdog', type: 'image' },
    { id: 9, image: '', word: 'Hotdog', type: 'word' },
    { id: 10, image: 'assets/img/card/ice cream.png', word: 'Ice Cream', type: 'image' },
    { id: 10, image: '', word: 'Ice Cream', type: 'word' },
    { id: 11, image: 'assets/img/card/ice.png', word: 'Ice', type: 'image' },
    { id: 11, image: '', word: 'Ice', type: 'word' },
    { id: 12, image: 'assets/img/card/juice.png', word: 'Juice', type: 'image' },
    { id: 12, image: '', word: 'Juice', type: 'word' },
    { id: 13, image: 'assets/img/card/meat.png', word: 'Meat', type: 'image' },
    { id: 13, image: '', word: 'Meat', type: 'word' },
    { id: 14, image: 'assets/img/card/pear.png', word: 'Pear', type: 'image' },
    { id: 14, image: '', word: 'Pear', type: 'word' },
    { id: 15, image: 'assets/img/card/pineapple.png', word: 'Pineapple', type: 'image' },
    { id: 15, image: '', word: 'Pineapple', type: 'word' },
    { id: 16, image: 'assets/img/card/popcorn.png', word: 'Popcorn', type: 'image' },
    { id: 16, image: '', word: 'Popcorn', type: 'word' },
    { id: 17, image: 'assets/img/card/potato.png', word: 'Potato', type: 'image' },
    { id: 17, image: '', word: 'Potato', type: 'word' },
    { id: 18, image: 'assets/img/card/rice.png', word: 'Rice', type: 'image' },
    { id: 18, image: '', word: 'Rice', type: 'word' },
    { id: 19, image: 'assets/img/card/salt.png', word: 'Salt', type: 'image' },
    { id: 19, image: '', word: 'Salt', type: 'word' },
    { id: 20, image: 'assets/img/card/steak.png', word: 'Steak', type: 'image' },
    { id: 20, image: '', word: 'Steak', type: 'word' },
    { id: 21, image: 'assets/img/card/strawberry.png', word: 'Strawberry', type: 'image' },
    { id: 21, image: '', word: 'Strawberry', type: 'word' },
    { id: 22, image: 'assets/img/card/summer.png', word: 'Summer', type: 'image' },
    { id: 22, image: '', word: 'Summer', type: 'word' },
    { id: 23, image: 'assets/img/card/sunglasses.png', word: 'Sunglasses', type: 'image' },
    { id: 23, image: '', word: 'Sunglasses', type: 'word' },
    { id: 24, image: 'assets/img/card/tomato.png', word: 'Tomato', type: 'image' },
    { id: 24, image: '', word: 'Tomato', type: 'word' },
    { id: 25, image: 'assets/img/card/water.png', word: 'Water', type: 'image' },
    { id: 25, image: '', word: 'Water', type: 'word' },
    { id: 26, image: 'assets/img/card/watermelon.png', word: 'Watermelon', type: 'image' },
    { id: 26, image: '', word: 'Watermelon', type: 'word' },
    { id: 27, image: 'assets/img/card/waves.png', word: 'Waves', type: 'image' },
    { id: 27, image: '', word: 'Waves', type: 'word' }
  ];

  getCards(count: number): any[] {
    console.log('CardService - getCards called with count:', count);
    let selectedCards = this.cards.slice(0, count * 2);
    let shuffledCards = this.shuffle([...selectedCards]);
    console.log('CardService - shuffledCards:', shuffledCards);
    return shuffledCards;
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

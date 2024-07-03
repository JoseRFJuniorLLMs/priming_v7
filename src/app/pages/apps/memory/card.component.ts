import { Component, OnInit } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface Card {
  id: number; // Adicionar um identificador único para cada carta
  word: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class CardComponent implements OnInit {
  cards: Card[] = [];
  moves: number = 0;
  remainingPairs: number = 0;
  private flippedCards: Card[] = [];
  gameCount: number = 0; // Contador de partidas

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.cardService.getCardsForGame().subscribe(cards => {
      if (cards.length > 0) {
        const shuffled = cards.sort(() => 0.5 - Math.random());
        this.cards = shuffled.map((card, index) => ({
          ...card,
          id: index, // Atribuir um ID único para cada carta
          isFlipped: false,
          isMatched: false
        }));
        this.moves = 0;
        this.remainingPairs = this.cards.length / 2; // Contar pares de cartas restantes
        this.gameCount++;

        // Adicionar classe de animação inicial
        setTimeout(() => {
          document.querySelectorAll('.card').forEach(element => {
            element.classList.add('initial-flip');
          });
        });

        // Remover classe de animação após 1 segundo e desvirar as cartas
        setTimeout(() => {
          document.querySelectorAll('.card').forEach(element => {
            element.classList.remove('initial-flip');
          });
          this.cards = this.cards.map(card => ({
            ...card,
            isFlipped: false
          }));
        }, 3000);
      } else {
        console.error('Nenhuma carta válida encontrada');
      }
    });
  }

  flipCard(card: Card) {
    if (card.isFlipped) return; // Se a carta já estiver virada, não faz nada

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2 || this.flippedCards.length === 3) {
      this.moves++;
      this.checkMatch();
    }
  }

  private checkMatch() {
    setTimeout(() => {
      const [card1, card2, card3] = this.flippedCards;

      if (this.flippedCards.length === 2) { // Verifica se é um par
        if (card1.word === card2.word) {
          card1.isMatched = card2.isMatched = true;
          this.remainingPairs--;

          if (this.remainingPairs === 0) {
            setTimeout(() => {
              this.newGame();
            }, 1000); // Aguarda 1 segundo antes de iniciar uma nova partida
          }
        } else {
          card1.isFlipped = card2.isFlipped = false;
        }
      } else if (this.flippedCards.length === 3) { // Verifica se é uma trinca
        if (card1.word === card2.word && card1.word === card3.word) {
          card1.isMatched = card2.isMatched = card3.isMatched = true;
          this.remainingPairs--;

          if (this.remainingPairs === 0) {
            setTimeout(() => {
              this.newGame();
            }, 1000); // Aguarda 1 segundo antes de iniciar uma nova partida
          }
        } else {
          card1.isFlipped = card2.isFlipped = card3.isFlipped = false;
        }
      }

      this.flippedCards = [];
    }, 1000); // Aguarda 1 segundo antes de verificar as cartas viradas
  }
}

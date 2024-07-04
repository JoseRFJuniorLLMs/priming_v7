import { Component, OnInit, OnDestroy } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Voice6RecognitionService } from './voice6-recognition.service'; // Certifique-se de importar o serviço VoiceRecognitionService corretamente
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { SatoshiService } from '../note/satoshi.service';

interface Card {
  id: number;
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
export class CardComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  moves = 0;
  remainingPairs = 0;
  private flippedCards: Card[] = [];
  gameCount = 0;
  private studentId = 'some-student-id'; // Substitua pelo ID real do estudante

  constructor(
    private cardService: CardService, 
    public voiceService: Voice6RecognitionService, 
    public soundService: SoundService,
    private satoshiService: SatoshiService // Injeção do SatoshiService
  ) {} 

  ngOnInit(): void {
    this.newGame();
  }

  ngOnDestroy(): void {
    // Limpar recursos, se necessário
  }

  newGame() {
    this.cardService.getCardsForGame().subscribe(cards => {
      if (cards.length > 0) {
        const shuffled = cards.sort(() => 0.5 - Math.random());
        this.cards = shuffled.map((card, index) => ({
          ...card,
          id: index,
          isFlipped: false,
          isMatched: false
        }));
        this.moves = 0;
        this.remainingPairs = this.cards.length / 2;
        this.gameCount++;

        // Incrementa o saldo de satoshi do jogador
        this.satoshiService.incrementSatoshi(this.studentId, 1).then(() => {
          console.log('Saldo de satoshi incrementado!');
        }).catch(error => {
          console.error('Erro ao incrementar saldo de satoshi:', error);
        });

      } else {
        console.error('Nenhuma carta válida encontrada');
      }
    });
  }

  flipCard(card: Card) {
    if (card.isFlipped || this.flippedCards.length === 2) return;

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  private checkMatch() {
    setTimeout(() => {
      const [card1, card2] = this.flippedCards;
  
      if (card1.word === card2.word) {
        card1.isMatched = card2.isMatched = true;
        this.remainingPairs--;
  
        // Falar o nome da palavra
        this.voiceService.speak("That's right, yes baby!" + card1.word);
  
        // Incrementar saldo de satoshi por acerto
        this.satoshiService.incrementSatoshi(this.studentId, 1).then(() => {
          console.log('Saldo de satoshi incrementado!');
        }).catch(error => {
          console.error('Erro ao incrementar saldo de satoshi:', error);
        });
  
        if (this.remainingPairs === 0) {
          setTimeout(() => {
            this.newGame();
          }, 1000);
        }
      } else {
        card1.isFlipped = card2.isFlipped = false;
  
        // Tocar o som quando erra o par de cartas
        this.soundService.playToasty();
      }
  
      this.flippedCards = [];
    }, 1000);
  }
  

}// fim

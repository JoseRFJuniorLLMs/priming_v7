import { Component, OnInit, OnDestroy } from '@angular/core';
import { CardService } from './card.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Voice6RecognitionService } from './voice6-recognition.service';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { SatoshiService } from '../note/satoshi.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../pages/auth/login/auth.service';

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
  private studentId = 'student-id'; 
  totalSatoshis = 0;
  showSatoshiAlert = false;
  private satoshiSubscription: Subscription | null = null;

  constructor(
    private cardService: CardService, 
    public voiceService: Voice6RecognitionService, 
    public soundService: SoundService,
    private satoshiService: SatoshiService,
    private authService: AuthService
  ) {} 

  ngOnInit(): void {
    this.authService.getUID().then(uid => {
      if (uid) {
        this.studentId = uid;
        this.newGame();
        this.updateSatoshiBalance();
      } else {
        console.error('Não foi possível obter o ID do estudante.');
      }
    }).catch(error => {
      console.error('Erro ao obter o ID do estudante:', error);
    });
  }

  ngOnDestroy(): void {
    if (this.satoshiSubscription) {
      this.satoshiSubscription.unsubscribe();
    }
  }

  updateSatoshiBalance() {
    if (!this.studentId) {
      console.error('O ID do estudante não está definido.');
      return;
    }
  
    this.satoshiSubscription = this.satoshiService.getSatoshiBalance(this.studentId).subscribe(
      balance => {
        this.totalSatoshis = balance;
      },
      error => console.error('Erro ao buscar o saldo de satoshi:', error)
    );
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
  
        this.voiceService.speak("That's right !" + card1.word);
  
        this.incrementSatoshi();
  
        if (this.remainingPairs === 0) {
          setTimeout(() => {
            this.newGame();
          }, 1000);
        }
      } else {
        card1.isFlipped = card2.isFlipped = false;
        this.soundService.playToasty();
      }
  
      this.flippedCards = [];
    }, 1000);
  }

  private incrementSatoshi() {
    if (!this.studentId) {
      console.error('O ID do estudante não está definido.');
      return;
    }

    this.satoshiService.incrementSatoshi(this.studentId, 1).subscribe(
      newBalance => {
        this.totalSatoshis = newBalance;
        this.showSatoshiAlert = true;
        setTimeout(() => this.showSatoshiAlert = false, 2000);
      },
      error => console.error('Erro ao incrementar saldo de satoshi:', error)
    );
  }
}

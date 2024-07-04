import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinoService } from './dinoservice';

interface Word {
  value: string;
  position: number;
  positionType: 'top' | 'bottom';
}

@Component({
  selector: 'app-dinossauro',
  templateUrl: './dinossauro.component.html',
  styleUrls: ['./dinossauro.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DinossauroComponent implements OnInit {
  gameStarted = false;
  dinoHeight = 0;
  jumpHeight = 150;
  words: Word[] = [];
  currentDinoFrame = 0;
  dinoFrames = [
    '-1338px -2px',  // Run frame 1
    '-1514px -2px',  // Run frame 2
  ];
  jumping = false;
  gameLoop: any;
  lastFrameTime = 0;
  frameDuration = 100; // Duração de cada frame em milissegundos

  constructor(private dinoService: DinoService) {}

  ngOnInit(): void {}

  startGame(): void {
    this.gameStarted = true;
    this.generateWords();
    this.startGameLoop();
  }

  generateWords(): void {
    setInterval(() => {
      this.dinoService.getNextWord().subscribe(card => {
        const word: Word = {
          value: card.word.toUpperCase(),
          position: window.innerWidth,
          positionType: Math.random() > 0.5 ? 'top' : 'bottom'
        };
        this.words.push(word);
      });
    }, 2000);
  }

  startGameLoop(): void {
    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      this.updateGame(deltaTime);
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    this.gameLoop = requestAnimationFrame(gameLoop);
  }

  updateGame(deltaTime: number): void {
    this.moveWords(deltaTime);
    this.checkCollision();
    this.updateDinoPosition(deltaTime);
    this.animateDino(deltaTime);
  }

  moveWords(deltaTime: number): void {
    const speed = 0.3; // Aumentado para mover as palavras mais rápido
    this.words.forEach((word) => {
      word.position -= speed * deltaTime;
    });
    // Remover palavras que saíram da tela
    this.words = this.words.filter(word => word.position > -100);
  }

  checkCollision(): void {
    const dinoRect = {
      left: 20,
      right: 20 + 88,
      top: 300 - this.dinoHeight - 94,
      bottom: 300 - this.dinoHeight
    };

    this.words = this.words.filter((word) => {
      const wordRect = {
        left: word.position,
        right: word.position + (word.value.length * 20),
        top: word.positionType === 'top' ? 60 : 240,
        bottom: word.positionType === 'top' ? 84 : 264 // Assuming 24px font size
      };

      if (
        dinoRect.left < wordRect.right &&
        dinoRect.right > wordRect.left &&
        dinoRect.top < wordRect.bottom &&
        dinoRect.bottom > wordRect.top
      ) {
        // Collision detected, remove the word
        return false;
      }
      return true;
    });
  }

  updateDinoPosition(deltaTime: number): void {
    if (this.jumping) {
      const jumpSpeed = 0.8; // Aumentado para um pulo mais alto
      this.dinoHeight += jumpSpeed * deltaTime;
      if (this.dinoHeight >= this.jumpHeight) {
        this.dinoHeight = this.jumpHeight;
        this.jumping = false;
      }
    } else if (this.dinoHeight > 0) {
      const fallSpeed = 0.5;
      this.dinoHeight -= fallSpeed * deltaTime;
      if (this.dinoHeight <= 0) {
        this.dinoHeight = 0;
      }
    }
  }

  animateDino(deltaTime: number): void {
    this.lastFrameTime += deltaTime;
    if (this.lastFrameTime >= this.frameDuration) {
      this.currentDinoFrame = (this.currentDinoFrame + 1) % this.dinoFrames.length;
      this.lastFrameTime = 0;
    }
  }

  @HostListener('window:keydown.space', ['$event'])
  jump(event: KeyboardEvent): void {
    if (!this.gameStarted || this.jumping || this.dinoHeight > 0) return;
    this.jumping = true;
  }

  ngOnDestroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }

  getDinoStyle(): any {
    return {
      backgroundPosition: this.dinoFrames[this.currentDinoFrame],
      bottom: `${this.dinoHeight}px`
    };
  }
}
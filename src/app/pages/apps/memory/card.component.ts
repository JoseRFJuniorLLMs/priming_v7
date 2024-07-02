import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule]
})
export class CardComponent implements OnInit, OnChanges {
  @Input() card: any;
  @Input() isFlipped: boolean = false;
  @Output() flipped = new EventEmitter<void>();

  ngOnInit() {
    console.log('CardComponent - Initialized with card:', this.card);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['card']) {
      console.log('CardComponent - Card input changed:', changes['card'].currentValue);
    }
  }

  onClick() {
    console.log('CardComponent - Card clicked:', this.card);
    this.isFlipped = !this.isFlipped;
    this.flipped.emit();
  }
}

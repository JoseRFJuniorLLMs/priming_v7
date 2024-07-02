import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule]
})
export class CardComponent implements OnInit {
  @Input() card: any;
  @Input() isFlipped: boolean = false;
  @Output() flipped = new EventEmitter<void>();

  ngOnInit() {
    console.log('Card:', this.card);
  }

  onClick() {
    this.isFlipped = !this.isFlipped;
    this.flipped.emit();
  }
}

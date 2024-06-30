import { Component } from '@angular/core';
// Importe quaisquer outros módulos ou componentes necessários
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'word-component',
  standalone: true,
  imports: [
    CommonModule, // CommonModule para diretivas como *ngIf, *ngFor, etc.
    MatButtonModule // MatButtonModule se você estiver usando botões do Material.
  ],
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss']
})
export class WordComponent {
  // Sua lógica de componente aqui
}

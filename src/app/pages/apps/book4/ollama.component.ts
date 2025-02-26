import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OllamaService } from './ollama.service';

@Component({
  selector: 'ollama',
  templateUrl: './ollama.component.html',
  styleUrls: ['./ollama.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule
  ]
})
export class OllamaComponent {
  prompt: string = '';
  response: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private ollamaService: OllamaService) { }

  getResponse(): void {
    this.loading = true;
    this.error = null;
    this.response = '';

    this.ollamaService.getResponse(this.prompt, 'llama3.1').subscribe({
      next: (chunk) => {
        this.response += chunk; // Append each chunk to the response
      },
      error: (err) => {
        this.error = 'Erro ao obter resposta: ' + err;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

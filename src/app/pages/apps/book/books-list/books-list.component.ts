import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import ePub from 'epubjs';

interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}

@Component({

  selector: 'books-list',
  templateUrl: 'books-list.html',
  styleUrls: ['books-list.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatBadgeModule, MatCardModule,
    MatIconModule, MatSelectModule,
    FormsModule, MatTooltipModule, CommonModule]

})

@Component({
  selector: 'vex-books-list',
  standalone: true,
  imports: [],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.scss'
})
export class BooksListComponent {

  ebooks: Ebook[] = [];
  book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;
  durationInSeconds = 130;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

   /* ==================Select Ebook==================== */
  async selectEbook(ebook: Ebook) {
    // Limpa a área de exibição
    const displayArea = document.getElementById("area-de-exibicao");
    if (displayArea) {
        displayArea.innerHTML = ''; // Remove o conteúdo anterior
    }
    // Inicializa o ePub com o caminho do arquivo do ebook selecionado
    try {
      this.book = ePub(ebook.path);
      console.log("Caminho do eBook selecionado:", ebook.path);
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao", {
        width: window.innerWidth,
        height: window.innerHeight,
        manager: 'continuous',
        spread: 'none'
      });
      await this.book.locations.generate(1024);
      this.totalPages = this.book.locations.length();
      this.currentPage = 1;

    } catch (error) {
      console.error("Erro ao carregar ou renderizar o livro: ", error);
    }
}


}

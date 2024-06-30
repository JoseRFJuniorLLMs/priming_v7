import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-imagem-popup',
  templateUrl: './imagem-popup.component.html',
  styleUrls: ['./imagem-popup.component.scss']
})
export class ImagemPopupComponent implements OnInit {
  mostrarImagem = true; // Continua sendo útil se você quiser uma lógica para mostrar/esconder a imagem
  imagens = [
    'assets/img/logo/priming.png',
    'assets/img/logo/priming2.png',
    'assets/img/logo/priming3.png',
    'assets/img/logo/priming4.png',
    'assets/img/logo/priming5.png',
    'assets/img/logo/priming6.png',
    'assets/img/logo/priming7.png',
    'assets/img/logo/priming8.png',
  ];
  imagemAtual: string | undefined; // Definido sem valor inicial aqui

  constructor(public dialogRef: MatDialogRef<ImagemPopupComponent>) {}

  ngOnInit() {
    // Escolhe uma imagem aleatoriamente para ser a imagem atual
    const indiceAleatorio = Math.floor(Math.random() * this.imagens.length);
    this.imagemAtual = this.imagens[indiceAleatorio];

    // Fecha o diálogo após 7 segundos (mantenha como estava no seu exemplo)
    setTimeout(() => this.dialogRef.close(), 7000);
  }
}

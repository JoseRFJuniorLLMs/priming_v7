import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-piece',
  templateUrl: './app-piece.component.html',
  styleUrls: ['./app-piece.component.css']
})
export class PieceComponent implements OnInit {

  @Input() piece: any;
  isMovable: boolean = false;

  constructor() {}

  ngOnInit() {}

  // ... lógica de arrastar e soltar

}

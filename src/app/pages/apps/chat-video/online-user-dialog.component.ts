import { Component } from '@angular/core';

@Component({
  selector: 'online-user-dialog',
  template: `
    <h1 mat-dialog-title>Usuário Online</h1>
    <div mat-dialog-content>
      <p>Há um usuário online esperando!</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Ok</button>
    </div>
  `
})
export class OnlineUserDialogComponent {}

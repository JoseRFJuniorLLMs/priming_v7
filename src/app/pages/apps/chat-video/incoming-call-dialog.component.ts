import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-incoming-call-dialog',
  template: `
    <h1 mat-dialog-title>Incoming Call</h1>
    <div mat-dialog-content>
      <p>{{ data.callNotification.from }} is calling you</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="acceptCall()">Accept</button>
      <button mat-button (click)="rejectCall()">Reject</button>
    </div>
  `
})
export class IncomingCallDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  acceptCall() {
    // Lógica para aceitar a chamada
  }

  rejectCall() {
    // Lógica para recusar a chamada
  }
}

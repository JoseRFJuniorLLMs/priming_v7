import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-incoming-call-dialog',
  template: `
    <h1 mat-dialog-title>Chamada Recebida</h1>
    <div mat-dialog-content>
      <p>{{ data.callNotification.from }} está chamando você</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="acceptCall()">Aceitar</button>
      <button mat-button (click)="rejectCall()">Rejeitar</button>
    </div>
  `
})
export class IncomingCallDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IncomingCallDialogComponent>
  ) {}

  acceptCall() {
    this.dialogRef.close('accept');
  }

  rejectCall() {
    this.dialogRef.close('reject');
  }
}

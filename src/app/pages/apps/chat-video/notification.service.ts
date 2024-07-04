import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { IncomingCallDialogComponent } from './incoming-call-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private dialog: MatDialog
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const userDoc = this.firestore.collection('students').doc(user.uid).valueChanges();
        const subscription = userDoc.subscribe((data: any) => {
          if (data?.callNotification) {
            this.openIncomingCallDialog(data.callNotification);
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  openIncomingCallDialog(callNotification: any) {
    const dialogRef = this.dialog.open(IncomingCallDialogComponent, {
      width: '300px',
      data: { callNotification }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Lógica para aceitar ou recusar a chamada
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

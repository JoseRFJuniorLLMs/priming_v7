import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { IncomingCallDialogComponent } from './incoming-call-dialog.component';
import { ChatVideoService } from './chat-video.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private dialog: MatDialog,
    private chatVideoService: ChatVideoService
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const userDoc = this.firestore.collection('students').doc(user.uid).valueChanges();
        const subscription = userDoc.subscribe((data: any) => {
          if (data?.callNotification) {
            this.openIncomingCallDialog(data.callNotification, user.uid);
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  openIncomingCallDialog(callNotification: any, userId: string) {
    const dialogRef = this.dialog.open(IncomingCallDialogComponent, {
      width: '300px',
      data: { callNotification }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'accept') {
        this.chatVideoService.answerCall(callNotification.callDocId);
      } else if (result === 'reject') {
        this.firestore.collection('calls').doc(callNotification.callDocId).update({
          status: 'rejected'
        });
      }
      // Limpar a notificação de chamada
      this.firestore.collection('students').doc(userId).update({
        callNotification: null
      });
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
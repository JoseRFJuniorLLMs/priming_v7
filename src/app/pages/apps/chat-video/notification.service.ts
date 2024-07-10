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
        this.listenForCallNotifications(user.uid);
      }
    });
  }

  listenForCallNotifications(userId: string) {
    const userDoc = this.firestore.collection('students').doc(userId);
    return userDoc.snapshotChanges().subscribe(snapshot => {
      const data = snapshot.payload.data() as any;
      if (data?.callNotification) {
        this.openIncomingCallDialog(data.callNotification, userId);
      }
    });
  }

  async sendCallNotification(targetUserId: string, callDocId: string, callerId: string) {
    const targetUserDoc = this.firestore.collection('students').doc(targetUserId);
    await targetUserDoc.update({
      callNotification: {
        from: callerId,
        callDocId: callDocId
      }
    });
  }

  openIncomingCallDialog(callNotification: any, userId: string) {
    const dialogRef = this.dialog.open(IncomingCallDialogComponent, {
      height: '600px',
      width: '600px',
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

import { Injectable, ElementRef } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
  doc,
  addDoc,
  writeBatch,
  DocumentSnapshot,
  getDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from '../../pages/auth/login/auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatVideoService {
  localStream!: MediaStream;
  remoteStream!: MediaStream;
  pc!: RTCPeerConnection;
  callDocId: string = '';
  secondPersonJoined: boolean = false;

  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private _snackBar: MatSnackBar,
    private firestore: Firestore,
    private soundService: SoundService,
    public authService: AuthService,
    private notificationService: NotificationService  // Adicionado aqui
  ) {}

  openSnackBar(textDisplay: string) {
    this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000 // Duration in milliseconds
    });
  }

  async startLocalStream() {
    this.soundService.playOn();
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    this.remoteStream = new MediaStream();
  }

  setupPeerConnection() {
    if (!this.localStream) {
      console.error('Local stream not initialized');
      return;
    }

    if (!this.pc) {
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });

      this.localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, this.localStream);
        this.openSnackBar('localStream.getTracks: ' + track);
      });

      this.pc.ontrack = (event) => {
        console.log('Track received:', event);
        this.openSnackBar('Track received: ' + event);
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
        } else {
          const inboundStream = new MediaStream();
          inboundStream.addTrack(event.track);
          this.remoteStream = inboundStream;
        }
        console.log('Remote stream:', this.remoteStream);
        this.openSnackBar('Remote stream: ' + this.remoteStream);
      };

      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE Candidate:', event.candidate);
          this.openSnackBar('ICE Candidate: ' + event.candidate);
          const candidatesCollection = collection(this.firestore, `calls/${this.callDocId}/offerCandidates`);
          addDoc(candidatesCollection, event.candidate.toJSON());
        }
      };
    }
  }

  async startCall(
    webcamVideo: ElementRef<HTMLVideoElement>,
    remoteVideo: ElementRef<HTMLVideoElement>,
    targetUserId?: string
  ) {
    await this.startLocalStream();
    this.soundService.playOn();
    this.setupPeerConnection();

    webcamVideo.nativeElement.srcObject = this.localStream;
    remoteVideo.nativeElement.srcObject = this.remoteStream;

    const callsSnapshot = await getDocs(collection(this.firestore, 'calls'));
    const existingCallDoc = callsSnapshot.docs[0];

    const currentUser = await this.authService.getCurrentUser();

    if (existingCallDoc) {
      this.callDocId = existingCallDoc.id;
      await this.answerCall(existingCallDoc);
    } else {
      if (currentUser && currentUser.uid) {
        await this.createOffer(currentUser.uid, targetUserId);

        if (targetUserId) {
          this.notificationService.sendCallNotification(targetUserId, this.callDocId, currentUser.uid);  // Notificação de chamada
        }
      } else {
        console.error('No user is currently logged in');
      }
    }
    await this.updateOnlineStatus(true);
  }

  async createOffer(userId: string, targetUserId?: string) {
    if (!this.pc) {
      console.error('RTCPeerConnection is not initialized');
      return;
    }

    const callDoc = doc(collection(this.firestore, 'calls'));
    this.callDocId = callDoc.id;

    const offerDescription = await this.pc.createOffer();
    console.log('Offer created:', offerDescription);
    this.openSnackBar('Offer created: ' + offerDescription);
    await this.pc.setLocalDescription(offerDescription);

    const callData: any = {
      offer: offerDescription,
      userId
    };

    if (targetUserId) {
      callData.targetUserId = targetUserId;
    }

    await setDoc(callDoc, callData);

    // Save WebRTC info for the user
    await this.saveWebRTCInfo(userId, {
      iceServers: this.pc.getConfiguration().iceServers,
      offerDescription: offerDescription
    });

    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data && data['answer']) {
        const answerDescription = new RTCSessionDescription(data['answer']);
        console.log('Answer received:', answerDescription);
        this.openSnackBar('Answer received: ' + answerDescription);
        await this.pc.setRemoteDescription(answerDescription);
      }
    });

    const answerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/answerCandidates`);
    onSnapshot(answerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          console.log('Answer ICE Candidate:', candidate);
          this.openSnackBar('Answer ICE Candidate: ' + candidate);
          this.pc.addIceCandidate(candidate);
        }
      });
    });
  }

  async saveWebRTCInfo(userId: string, info: any) {
    const userDoc = doc(this.firestore, `students/${userId}`);
    await setDoc(userDoc, { webrtc: info }, { merge: true });
  }

  async answerCall(callDoc: DocumentSnapshot) {
    this.callDocId = callDoc.id;
    const callData = callDoc.data();

    if (callData && callData['offer']) {
      const offerDescription = new RTCSessionDescription(callData['offer']);
      console.log('Offer received:', offerDescription);
      this.openSnackBar('Offer received: ' + offerDescription);
      await this.pc.setRemoteDescription(offerDescription);

      const answerDescription = await this.pc.createAnswer();
      console.log('Answer created:', answerDescription);
      this.openSnackBar('Answer created: ' + answerDescription);
      await this.pc.setLocalDescription(answerDescription);

      await setDoc(callDoc.ref, { answer: answerDescription });

      const offerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/offerCandidates`);
      onSnapshot(offerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            console.log('Offer ICE Candidate:', candidate);
            this.openSnackBar('Offer ICE Candidate: ' + candidate);
            this.pc.addIceCandidate(candidate);
          }
        });
      });

      const answerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/answerCandidates`);
      onSnapshot(answerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            console.log('Answer ICE Candidate:', candidate);
            this.openSnackBar('Answer ICE Candidate: ' + candidate);
            this.pc.addIceCandidate(candidate);
          }
        });
      });
    }
  }

  async finishCall() {
    this.soundService.playClose();
    if (!this.callDocId) {
      console.error('Invalid callDocId');
      this.openSnackBar('No call documents found to delete.');
      return;
    }

    await this.updateOnlineStatus(false);

    const callsSnapshot = await getDocs(collection(this.firestore, 'calls'));
    const batch = writeBatch(this.firestore);

    if (callsSnapshot.empty) {
      console.log('No call documents found to delete.');
      this.openSnackBar('No call documents found to delete.');
    } else {
      callsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      this.openSnackBar('The call has ended and all call documents have been deleted.');
    }

    if (this.pc) {
      this.pc.close();
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }

    this.callDocId = '';
  }

  async updateOnlineStatus(status: boolean) {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userDoc = doc(this.firestore, `students/${user.uid}`);
      await setDoc(userDoc, { online: status }, { merge: true });
    } else {
      console.error('No user is currently logged in');
    }
  }

  async checkUserOnlineStatus(callDocId: string): Promise<boolean> {
    this.soundService.playOnline();
    if (!callDocId) {
      console.error('Invalid callDocId');
      return false;
    }
    const userDoc = doc(this.firestore, `students/${callDocId}`);
    const userSnapshot = await getDoc(userDoc);
    const onlineStatus = userSnapshot.exists() && userSnapshot.data()?.['online'];
    console.log(`Checked user online status for ${callDocId}: ${onlineStatus}`);
    return onlineStatus;
  }

  muteMicrophone() {
    this.soundService.playClose();
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      this.soundService.playClose();
    });
  }

  turnOffCamera() {
    this.soundService.playClose();
    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      this.soundService.playOn();
    });
  }

  async shareScreen() {
    this.soundService.playDone();
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      this.pc.getSenders().forEach((sender) => {
        if (sender.track?.kind === 'video') {
          sender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = () => {
        this.localStream.getVideoTracks().forEach((track) => {
          this.pc.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(track);
            }
          });
        });
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }

  openChat() {
    console.log('Open chat function called');
    // TODO: Implement chat logic (e.g., modal, side panel, etc.)
  }

  endCall() {
    this.finishCall();
    this.soundService.playClose();
  }

  async setupWebRTCForUser(userId: string) {
    const userDoc = doc(this.firestore, `students/${userId}`);
    await setDoc(userDoc, { webrtc: { /* Add WebRTC configuration data here */ } }, { merge: true });
  }

  async tearDownWebRTCForUser(userId: string) {
    const userDoc = doc(this.firestore, `students/${userId}`);
    await setDoc(userDoc, { webrtc: {} }, { merge: true });
  }

  async deleteCallInfo() {
    if (!this.callDocId) {
      console.error('Invalid callDocId');
      return;
    }

    const callDoc = doc(this.firestore, `calls/${this.callDocId}`);
    await deleteDoc(callDoc);
  }
}

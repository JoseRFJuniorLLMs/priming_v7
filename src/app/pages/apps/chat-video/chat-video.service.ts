import { Injectable, ElementRef } from '@angular/core';
import { Firestore, collection, getDocs, setDoc, onSnapshot, doc, addDoc, writeBatch, DocumentSnapshot, getDoc, deleteDoc, updateDoc, runTransaction } from '@angular/fire/firestore';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/pages/apps/chat-video/notification.service';
import { AuthService } from '../../pages/auth/login/auth.service';

export enum CallState {
  IDLE,
  CALLING,
  IN_CALL,
  ENDED
}

@Injectable({
  providedIn: 'root'
})
export class ChatVideoService {

  currentUserId: string = '';

  setCurrentUserId(loggedUserId: string) {
    this.currentUserId = loggedUserId;
    console.log('Current User ID set to:', this.currentUserId);
  }

  localStream!: MediaStream;
  remoteStream!: MediaStream;
  pc: RTCPeerConnection | null = null;
  callDocId: string = '';
  secondPersonJoined: boolean = false;
  private callState: CallState = CallState.IDLE;

  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private _snackBar: MatSnackBar,
    private firestore: Firestore,
    private soundService: SoundService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    console.log('ChatVideoService constructor - AuthService:', authService);
    console.log('ChatVideoService constructor - Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
  }

  openSnackBar(textDisplay: string) {
    this._snackBar.open(textDisplay, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000
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

  setupPeerConnection(remoteVideo: HTMLVideoElement) {
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
        this.pc?.addTrack(track, this.localStream);
        console.log('localStream.getTracks :', track);
      });
  
      this.pc.ontrack = (event) => {
        console.log('Track received:', event);
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
        } else {
          const inboundStream = new MediaStream();
          inboundStream.addTrack(event.track);
          this.remoteStream = inboundStream;
        }
        remoteVideo.srcObject = this.remoteStream; // add remoto
        console.log('Remote stream:', this.remoteStream);
      };
  
      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE Candidate:', event.candidate);
          const candidatesCollection = collection(this.firestore, `calls/${this.callDocId}/offerCandidates`);
          addDoc(candidatesCollection, event.candidate.toJSON());
        }
      };
    }
  }
  
  async startCall(
    webcamVideo: ElementRef<HTMLVideoElement>,
    remoteVideo: ElementRef<HTMLVideoElement>,
    currentUserId: string, 
    targetUserId?: string
  ) {
    try {
      await this.startLocalStream();
      this.soundService.playOn();
      this.setupPeerConnection(remoteVideo.nativeElement);  
  
      webcamVideo.nativeElement.srcObject = this.localStream;
      remoteVideo.nativeElement.srcObject = this.remoteStream;
  
      const callsSnapshot = await getDocs(collection(this.firestore, 'calls'));
      const existingCallDoc = callsSnapshot.docs[0];
  
      console.log('Current User ID:>>>>', currentUserId);
  
      if (!currentUserId) {
        console.error('No user is currently logged in or user ID is not available');
        return;
      }
  
      if (existingCallDoc) {
        this.callDocId = existingCallDoc.id;
        await this.answerCall(existingCallDoc);
        console.log('answerCall:>>>>', targetUserId, currentUserId);
      } else {
        await this.createOffer(currentUserId, targetUserId);
        console.log('createOffer:>>>>', targetUserId, currentUserId);
  
        if (targetUserId) {
          this.notificationService.sendCallNotification(targetUserId, this.callDocId, currentUserId);
          console.log('sendCallNotification:>>>>', targetUserId, currentUserId);
        }
      }
  
      await this.updateCallState(currentUserId, CallState.CALLING);
      await this.updateOnlineStatus(currentUserId, true);
    } catch (error) {
      console.error('Error during startCall:', error);
    }
  }
  
  async finishCall() {
    try {
      this.soundService.playClose();
      if (!this.callDocId) {
        console.error('Invalid callDocId');
        return;
      }

      await this.updateOnlineStatus(this.currentUserId, false);
      await this.updateCallState(this.currentUserId, CallState.ENDED);

      const callsSnapshot = await getDocs(collection(this.firestore, 'calls'));
      const batch = writeBatch(this.firestore);

      if (callsSnapshot.empty) {
        console.log('No call documents found to delete.');
      } else {
        callsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
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
    } catch (error) {
      console.error('Error during finishCall:', error);
    } finally {
      await this.cleanupResources();
    }
  }

  async createOffer(userId: string, targetUserId?: string) {
    try {
      if (!this.pc) {
        console.error('RTCPeerConnection is not initialized');
        return;
      }

      const callDoc = doc(collection(this.firestore, 'calls'));
      this.callDocId = callDoc.id;

      const offerDescription = await this.pc.createOffer();
      console.log('Offer created:', offerDescription);
      await this.pc.setLocalDescription(offerDescription);

      const callData: any = {
        offer: offerDescription,
        userId
      };

      if (targetUserId) {
        callData.targetUserId = targetUserId;
      }

      await setDoc(callDoc, callData);

      await this.saveWebRTCInfo(userId, {
        iceServers: this.pc.getConfiguration().iceServers,
        offerDescription: offerDescription
      });

      onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (this.pc && !this.pc.currentRemoteDescription && data && data['answer']) {
          const answerDescription = new RTCSessionDescription(data['answer']);
          console.log('Answer received:', answerDescription);
          await this.pc.setRemoteDescription(answerDescription);
        }
      });

      const answerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/answerCandidates`);
      onSnapshot(answerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            console.log('Answer ICE Candidate:', candidate);
            this.pc?.addIceCandidate(candidate);
          }
        });
      });
    } catch (error) {
      console.error('Error during createOffer:', error);
    }
  }

  async saveWebRTCInfo(userId: string, info: any) {
    try {
      const userDoc = doc(this.firestore, `students/${userId}`);
      await setDoc(userDoc, { webrtc: info }, { merge: true });
    } catch (error) {
      console.error('Error during saveWebRTCInfo:', error);
    }
  }

  async answerCall(callDoc: DocumentSnapshot) {
    try {
      this.callDocId = callDoc.id;
      const callData = callDoc.data();

      if (callData && callData['offer']) {
        const offerDescription = new RTCSessionDescription(callData['offer']);
        console.log('Offer received:', offerDescription);
        if (this.pc) {
          await this.pc.setRemoteDescription(offerDescription);

          const answerDescription = await this.pc.createAnswer();
          console.log('Answer created:', answerDescription);
          await this.pc.setLocalDescription(answerDescription);

          await setDoc(callDoc.ref, { answer: answerDescription });

          const offerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/offerCandidates`);
          onSnapshot(offerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                console.log('Offer ICE Candidate:', candidate);
                this.pc?.addIceCandidate(candidate);
              }
            });
          });

          const answerCandidatesCollection = collection(this.firestore, `calls/${this.callDocId}/answerCandidates`);
          onSnapshot(answerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                console.log('Answer ICE Candidate:', candidate);
                this.pc?.addIceCandidate(candidate);
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Error during answerCall:', error);
    }
  }

  async cleanupResources() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
    }
    await this.deleteCallInfo();
    this.updateCallState(this.currentUserId, CallState.IDLE);
  }

  async checkUserOnlineStatus(callDocId: string): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error('Error during checkUserOnlineStatus:', error);
      return false;
    }
  }

  muteMicrophone() {
    try {
      this.soundService.playClose();
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        this.soundService.playClose();
      });
    } catch (error) {
      console.error('Error during muteMicrophone:', error);
    }
  }

  turnOffCamera() {
    try {
      this.soundService.playClose();
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        this.soundService.playOn();
      });
    } catch (error) {
      console.error('Error durante turnOffCamera:', error);
    }
  }

  async shareScreen() {
    try {
      this.soundService.playDone();
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      this.pc?.getSenders().forEach((sender) => {
        if (sender.track?.kind === 'video') {
          sender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = () => {
        this.localStream.getVideoTracks().forEach((track) => {
          this.pc?.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'video') {
              sender.replaceTrack(track);
            }
          });
        });
      };
    } catch (error) {
      console.error('Error during shareScreen:', error);
    }
  }

  openChat() {
    console.log('Open chat function called');
  }

  endCall() {
    try {
      this.finishCall();
      this.soundService.playClose();
    } catch (error) {
      console.error('Error durante endCall:', error);
    }
  }

  async setupWebRTCForUser(userId: string) {
    try {
      const userDoc = doc(this.firestore, `students/${userId}`);
      await setDoc(userDoc, { webrtc: { /* Add WebRTC configuration data here */ } }, { merge: true });
    } catch (error) {
      console.error('Error durante setupWebRTCForUser:', error);
    }
  }

  async tearDownWebRTCForUser(userId: string) {
    try {
      const userDoc = doc(this.firestore, `students/${userId}`);
      await setDoc(userDoc, { webrtc: {} }, { merge: true });
    } catch (error) {
      console.error('Error durante tearDownWebRTCForUser:', error);
    }
  }

  async deleteCallInfo() {
    try {
      if (!this.callDocId) {
        console.error('Invalid callDocId');
        return;
      }

      const callDoc = doc(this.firestore, `calls/${this.callDocId}`);
      await deleteDoc(callDoc);
    } catch (error) {
      console.error('Error durante deleteCallInfo:', error);
    }
  }

  async updateOnlineStatus(userId: string, status: boolean) {
    try {
      const userDoc = doc(this.firestore, `students/${userId}`);
      await setDoc(userDoc, { online: status }, { merge: true });
    } catch (error) {
      console.error('Error during updateOnlineStatus:', error);
    }
  }

  private async updateCallState(userId: string, state: CallState) {
    this.callState = state;
    try {
      const userDoc = doc(this.firestore, `students/${userId}`);
      await updateDoc(userDoc, {
        callState: state
      });
    } catch (error) {
      console.error('Error updating call state:', error);
    }
  }


}//fim

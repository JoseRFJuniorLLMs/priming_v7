import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  Inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ChatVideoService } from './chat-video.service';
import { Firestore } from '@angular/fire/firestore';
import { OnlineUserDialogComponent } from './online-user-dialog.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import screenfull from 'screenfull';

@Component({
  selector: 'chat-video',
  templateUrl: './chat-video.component.html',
  styleUrls: ['./chat-video.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ChatVideoComponent implements OnInit, OnDestroy {
  @ViewChild('webcamVideo') webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  inCall: boolean = false;
  otherUserOnline: boolean = false;
  checkUserOnlineInterval: any;
  collapsed: any;
  layoutService: any;
  targetUserId: string;

  constructor(
    public chatVideoService: ChatVideoService,
    public firestore: Firestore,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { targetUserId: string }
  ) {
    this.targetUserId = data.targetUserId;
  }

  async ngOnInit() {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.toggleCollapse();
    }
    await this.startCall(); // Iniciar a chamada ao abrir o diálogo
    this.startPeriodicCheck();
  }

  ngOnDestroy(): void {
    if (this.checkUserOnlineInterval) {
      clearInterval(this.checkUserOnlineInterval);
    }
  }

  startPeriodicCheck() {
    this.checkUserOnlineInterval = setInterval(async () => {
      const isOnline = await this.chatVideoService.checkUserOnlineStatus(
        this.targetUserId
      );
      console.log(`User online status: ${isOnline}`); // Log para depuração
      if (isOnline && !this.otherUserOnline) {
        this.openOnlineUserDialog();
      }
      this.otherUserOnline = isOnline;
      this.cdr.detectChanges(); // Forçar detecção de mudanças
    }, 10000); // Verificação a cada 10 segundos para testes
  }

  openOnlineUserDialog() {
    console.log('Opening online user dialog'); // Log para depuração
    this.dialog.open(OnlineUserDialogComponent, {
      width: '250px'
    });
  }

  async toggleCall() {
    if (this.inCall) {
      this.finishCall();
    } else {
      await this.startCall();
    }
    this.inCall = !this.inCall;
  }

  async startCall() {
    await this.chatVideoService.startCall(this.webcamVideo, this.remoteVideo, this.targetUserId);
    this.otherUserOnline = await this.chatVideoService.checkUserOnlineStatus(
      this.targetUserId
    );
    this.cdr.detectChanges(); // Forçar detecção de mudanças
  }

  finishCall() {
    this.chatVideoService.finishCall();
    this.inCall = false;
    this.otherUserOnline = false;
    this.cdr.detectChanges(); // Forçar detecção de mudanças
  }

  muteMicrophone() {
    this.chatVideoService.muteMicrophone();
  }

  turnOffCamera() {
    this.chatVideoService.turnOffCamera();
  }

  async shareScreen() {
    await this.chatVideoService.shareScreen();
  }

  openChat() {
    this.chatVideoService.openChat();
  }

  endCall() {
    this.finishCall();
    this.inCall = false;
  }

  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  }
}

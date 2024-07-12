import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatVideoComponent } from './chat-video.component';
import { Student } from 'src/app/model/student/student';

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.scss']
})
export class IncomingCallDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IncomingCallDialogComponent>,
    private router: Router,
    private dialog: MatDialog
  ) {}

  acceptCall() {
    this.callStudent(this.data.student);
    this.dialogRef.close('accept');
  }

  callStudent(student: Student) {
    const dialogRef = this.dialog.open(ChatVideoComponent, {
      width: '90%',
      height: '90%',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { targetUserId: student._id }
    });
  }

  rejectCall() {
    this.dialogRef.close('reject');
  }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-student-dialog',
  templateUrl: './delete-student-dialog.component.html',
  styleUrls: ['./delete-student-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ]
})
export class DeleteStudentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteStudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

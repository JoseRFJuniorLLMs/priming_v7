import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NoteCollection } from '../../note/note-collection';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule ,
    MatTooltipModule,
    MatBadgeModule
  ]
})
export class NoteDialogEditComponent {
  constructor(
    public dialogRef: MatDialogRef<NoteDialogEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoteCollection
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import screenfull from 'screenfull';
import { VozComponent } from '../puzzle-block/voz.component';
import { PuzzleBlockComponent } from '../puzzle-block/puzzle-block.component';
import { GoogleBooksService } from './google.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'vex-file-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    VozComponent,
    PuzzleBlockComponent,
    MatProgressBarModule
  ],
  templateUrl: './file-dialog.component.html',
  styleUrl: './file-dialog.component.scss'
})
export class FileDialogComponent {
  constructor(
    public booksService: GoogleBooksService,
    public dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { text: string }
  ) {}
}

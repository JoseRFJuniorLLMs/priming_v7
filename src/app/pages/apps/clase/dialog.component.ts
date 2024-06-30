import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShareBottomWimHofComponent } from '../../dashboards/components/share-bottom-wim-hof/share-bottom-wim-hof.component';
import { ShareBottomZettelComponent } from '../../dashboards/components/share-bottom-zettel/share-bottom-zettel.component';

@Component({
  selector: 'dialog-zettel',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule
  ],
})
export class DialogZettelComponent {
  constructor(
    private _bottomSheet: MatBottomSheet,
    private dialogRef: MatDialogRef<DialogZettelComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close();
    setTimeout(() => {
      this._bottomSheet.open(ShareBottomZettelComponent);
    }, 100); 
  }
}

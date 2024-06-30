import { Component, OnInit } from '@angular/core';
import {
  MatBottomSheetModule,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import screenfull from 'screenfull';

@Component({
  selector: 'vex-share-bottom-sheet',
  templateUrl: './share-bottom-sheet.component.html',
  styleUrls: ['./share-bottom-sheet.component.scss'],
  standalone: true,
  imports: [MatListModule, RouterLink, MatIconModule, MatBottomSheetModule]
})
export class ShareBottomSheetComponent implements OnInit {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomSheetComponent>
  ) {}

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
 }

  close() {
    this._bottomSheetRef.dismiss();
  }
}

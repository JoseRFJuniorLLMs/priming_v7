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
  selector: 'vex-share-bottom-wim-hof',
  templateUrl: './share-bottom-wim-hof.component.html',
  styleUrls: ['./share-bottom-wim-hof.component.scss'],
  standalone: true,
  imports: [MatListModule, RouterLink, MatIconModule, MatBottomSheetModule]
})
export class ShareBottomWimHofComponent implements OnInit {
  collapsed: any;
  layoutService: any;
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomWimHofComponent>
  ) {}

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.toggleCollapse();
    }
 }

  close() {
    this._bottomSheetRef.dismiss();
  }
  
  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  } //fim
}

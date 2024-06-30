import {
  MatBottomSheetModule,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

import { DialogModule } from '@angular/cdk/dialog';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';

import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CommonModule } from '@angular/common';
import screenfull from 'screenfull';
import { GameComponent } from 'src/app/pages/apps/voice-comand/game.component';

@Component({
  selector: 'vex-share-bottom-game',
  templateUrl: './share-bottom-game.component.html',
  styleUrls: ['./share-bottom-game.component.scss'],
  standalone: true,
  imports: [
    MatListModule,
    RouterLink,
    MatIconModule,
    MatBottomSheetModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    ReactiveFormsModule,
    MatButtonModule,
    CdkDrag,
    CdkDropList,
    DialogModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatTooltipModule,
    TextFieldModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    CommonModule,
    GameComponent
  ]
})
export class ShareBottomGameComponent implements OnInit {
  collapsed: any;
  layoutService: any;
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomGameComponent>
  ) {}

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  close() {
    this._bottomSheetRef.dismiss();
  }


  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.toggleCollapse();
    }
 }
 toggleCollapse() {
  this.collapsed
    ? this.layoutService.expandSidenav()
    : this.layoutService.collapseSidenav();
} //fim
}

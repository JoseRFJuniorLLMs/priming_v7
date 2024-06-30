import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetModule
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { scaleInOutAnimation } from '@vex/animations/scale-in-out.animation';

import { ShareBottomZettelComponent } from '../../../../pages/dashboards/components/share-bottom-zettel/share-bottom-zettel.component';
import { ShareBottomGpt4Component } from '../../../../pages/dashboards/components/share-bottom-gpt4/share-bottom-gpt4.component';
import { ShareBottomSheetComponent } from '../../../../pages/dashboards/components/share-bottom-sheet/share-bottom-sheet.component';
import { ShareBottomWimHofComponent } from '../../../../pages/dashboards/components/share-bottom-wim-hof/share-bottom-wim-hof.component';

@Component({
  selector: 'vex-config-panel-toggle',
  templateUrl: './config-panel-toggle.component.html',
  styleUrls: ['./config-panel-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleInOutAnimation],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule,
    MatTooltipModule
  ]
})
export class ConfigPanelToggleComponent implements OnInit {
  @Output() openConfig = new EventEmitter();
  @Output() openBottomConfig = new EventEmitter();

  showButton: boolean = false;
  result?: string;

  constructor(
    private _bottomSheet: MatBottomSheet,
    dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openBothConfigs() {
    this.openConfig.emit();
    this.openBottomConfig.emit();
  }
  openBothConfigsWimHof() {
    this._bottomSheet.open(ShareBottomWimHofComponent);
  }

  openBothConfigsBottomSheet() {
    this._bottomSheet.open(ShareBottomSheetComponent);
  }
  openBothConfigsZettel() {
    this._bottomSheet.open(ShareBottomZettelComponent);
  }

  openBothConfigsGpt4() {
    this._bottomSheet.open(ShareBottomGpt4Component);
  }
}

import { Component, ElementRef, Inject, Input, OnInit, ViewChild, NgZone, ChangeDetectorRef  } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { HttpClient } from '@angular/common/http';

import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexScrollbarComponent } from '@vex/components/vex-scrollbar/vex-scrollbar.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { MatDialog } from '@angular/material/dialog';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

import { Observable } from 'rxjs';

import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { StudentService } from '../student.service';

@Component({
  selector: 'vex-student',
  standalone: true,
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
  animations: [stagger40ms, fadeInUp400ms],
  imports: [
    CdkDrag,
    MatIconModule,
    MatButtonModule,
    NgFor,
    MatRippleModule,
    RouterLinkActive,
    NgClass,
    RouterOutlet,
    MatSidenavModule,
    MatMenuModule,
    NgIf,
    VexScrollbarComponent,
    AsyncPipe,
    MatDividerModule,
    MatInputModule,
    CdkDropList,
    VexBreadcrumbsComponent,
    VexSecondaryToolbarComponent
  ],
})


export class StudentComponent implements OnInit {

  //==========Construtor=============//
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private elementRef: ElementRef,
    @Inject(Firestore) private firestore: Firestore,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
    private studentService: StudentService

  ) {
  
  }


  ngOnInit(): void {

  }


}

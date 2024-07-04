import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Student } from 'src/app/model/student/student';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StudentService } from '../student.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatVideoComponent } from '../../chat-video/chat-video.component';
import { ClearCallsComponent } from '../../clean/clear-calls.component';

@Component({
  selector: 'aio-table',
  templateUrl: './aio-table.component.html',
  styleUrls: ['./aio-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
    ClearCallsComponent
  ]
})
export class AioTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'satoshis', 'online', 'action'];
  dataSource = new MatTableDataSource<Student>();
  searchCtrl = new FormControl();
  layoutCtrl = new FormControl('boxed');

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private studentService: StudentService, 
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.studentService.getStudents().subscribe(students => {
      this.dataSource.data = students;
      this.sortDataBySatoshis();
    });

    this.searchCtrl.valueChanges.subscribe(value => this.applyFilter(value));
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'satoshis': return item.satoshiBalance || 0;
          default: return (item as any)[property];
        }
      };
    }
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  getOnlineStatusClass(online: boolean): string {
    return online ? 'online' : 'offline';
  }

  getButtonClass(online: boolean): string {
    return online ? 'call-button-online' : 'call-button-offline';
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

  sortDataBySatoshis() {
    this.dataSource.data = this.dataSource.data.sort((a, b) => 
      (b.satoshiBalance || 0) - (a.satoshiBalance || 0)
    );
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'satoshis': return this.compare(a.satoshiBalance || 0, b.satoshiBalance || 0, isAsc);
        case 'name': return this.compare(a.name || '', b.name || '', isAsc);
        case 'email': return this.compare(a.email || '', b.email || '', isAsc);
        case 'online': return this.compare(a.online ? 1 : 0, b.online ? 1 : 0, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
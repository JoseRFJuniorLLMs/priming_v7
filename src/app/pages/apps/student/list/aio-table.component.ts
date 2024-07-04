import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Student } from 'src/app/model/student/student';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StudentService } from '../student.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatVideoComponent } from '../../chat-video/chat-video.component';

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
    MatButtonToggleModule
  ]
})
export class AioTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'online', 'action'];
  dataSource = new MatTableDataSource<Student>();
  searchCtrl = new FormControl();
  layoutCtrl = new FormControl('boxed');

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(private studentService: StudentService, private dialog: MatDialog) {}

  ngOnInit() {
    this.studentService.getStudents().subscribe(students => {
      this.dataSource.data = students;
    });

    this.searchCtrl.valueChanges.subscribe(value => this.applyFilter(value));
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
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
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: { targetUserId: student._id }
    });
  }
  
}//fim

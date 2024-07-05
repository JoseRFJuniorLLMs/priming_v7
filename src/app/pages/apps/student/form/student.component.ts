import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StudentService } from '../student.service';
import { Student } from 'src/app/model/student/student';
import { EditStudentDialogComponent } from './edit-student-dialog.component';
import { DeleteStudentDialogComponent } from './delete-student-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';


@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCardModule,
    MatListModule,
    MatDialogModule,
    MatBadgeModule
  ]
})
export class StudentComponent implements OnInit {
  student$!: Observable<Student | null>;
  students$!: Observable<Student[]>;
  selectedStudent: Student | null = null;

  constructor(
    public dialog: MatDialog,
    @Inject(Firestore) private firestore: Firestore,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.student$ = this.studentService.getStudentData();
    this.students$ = this.studentService.getStudents();
  }

  addStudent(student: Student) {
    this.studentService.addStudentData(student).then(() => {
      console.log('Student added successfully');
    }).catch(error => {
      console.error('Error adding student:', error);
    });
  }

  updateStudent(student: Student) {
    this.studentService.updateStudentData(student).then(() => {
      console.log('Student updated successfully');
    }).catch(error => {
      console.error('Error updating student:', error);
    });
  }

  deleteStudent(id: string) {
    if (id) {
      this.studentService.deleteStudentData(id).then(() => {
        console.log('Student deleted successfully');
      }).catch(error => {
        console.error('Error deleting student:', error);
      });
    } else {
      console.error('Error: Student ID is undefined');
    }
  }

  openEditDialog(student: Student) {
    const dialogRef = this.dialog.open(EditStudentDialogComponent, {
      width: '80vw',
      height: '80vw',
      data: { ...student }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateStudent(result);
      }
    });
  }

  openDeleteDialog(id: string) {
    const dialogRef = this.dialog.open(DeleteStudentDialogComponent, {
      width: '300px',
      data: { id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteStudent(id);
      }
    });
  }

  selectStudent(student: Student) {
    this.selectedStudent = student;
  }

  clearSelection() {
    this.selectedStudent = null;
  }
}

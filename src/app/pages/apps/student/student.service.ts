import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Student } from 'src/app/model/student/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  getStudentData(): Observable<Student | null> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          return this.firestore.doc<Student>(`students/${user.uid}`).valueChanges().pipe(
            map(student => student || null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  getStudents(): Observable<Student[]> {
    return this.firestore.collection<Student>('students').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Student;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addStudentData(student: Student): Promise<void> {
    const id = this.firestore.createId();
    student._id = id;
    return this.firestore.doc(`students/${id}`).set(student);
  }

  updateStudentData(student: Student): Promise<void> {
    if (!student._id) {
      throw new Error('Student ID is required for update.');
    }
    return this.firestore.doc(`students/${student._id}`).update(student);
  }

  deleteStudentData(id: string): Promise<void> {
    return this.firestore.doc(`students/${id}`).delete();
  }

  getLastLogin(loginHistory?: string[]): string {
    return loginHistory && loginHistory.length > 0 ? loginHistory[loginHistory.length - 1] : 'N/A';
  }
}

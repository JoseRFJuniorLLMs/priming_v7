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
            map(student => student || null) // Ensure undefined is converted to null
          );
        } else {
          return of(null);
        }
      })
    );
  }

  addStudentData(student: Student) {
    console.log('Adding student data:', student);
    return this.firestore.doc(`students/${student._id}`).set(student);
  }
}

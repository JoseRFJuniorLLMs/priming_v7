import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

import { StudentCollection } from './form/student-collection';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  studentCollection$!: Observable<StudentCollection[]>;

  constructor(
    private http: HttpClient,
    @Inject(Firestore) private firestore: Firestore,
  ) {
    const studentCollection = collection(this.firestore, 'StudentCollection');
    this.studentCollection$ = collectionData(studentCollection) as Observable<StudentCollection[]>;
  }

  ngOnInit(): void {
    console.log(StudentCollection);
  }

}

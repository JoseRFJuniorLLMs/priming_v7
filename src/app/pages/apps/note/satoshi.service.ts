import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SatoshiService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  getSatoshiBalance(studentId: string): Observable<number> {
    const studentDocRef = this.firestore.collection('students').doc(studentId);
    return studentDocRef.valueChanges().pipe(
      map(doc => doc ? (doc as any).satoshiBalance ?? 0 : 0)
    );
  }

  async incrementSatoshi(studentId: string, amount: number): Promise<void> {
    const studentDocRef = this.firestore.collection('students').doc(studentId);
    return this.firestore.firestore.runTransaction(async transaction => {
      const studentDoc = await transaction.get(studentDocRef.ref);
      if (studentDoc.exists) {
        const currentBalance = (studentDoc.data() as any).satoshiBalance ?? 0;
        const newBalance = currentBalance + amount;
        transaction.update(studentDocRef.ref, { satoshiBalance: newBalance });
      } else {
        transaction.set(studentDocRef.ref, { satoshiBalance: amount });
      }
    });
  }
}

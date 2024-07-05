import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

interface StudentData {
  satoshiBalance?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SatoshiService {

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  getSatoshiBalance(studentId: string): Observable<number> {
    return this.firestore.doc<StudentData>(`students/${studentId}`).valueChanges().pipe(
      map(doc => doc?.satoshiBalance || 0)
    );
  }

  incrementSatoshi(studentId: string, amount: number): Observable<number> {
    const docRef = this.firestore.doc<StudentData>(`students/${studentId}`);
    
    return from(this.firestore.firestore.runTransaction(async transaction => {
      const studentDoc = await transaction.get(docRef.ref);
      let newBalance: number;
      if (studentDoc.exists) {
        const data = studentDoc.data() as StudentData;
        const currentBalance = data?.satoshiBalance || 0;
        newBalance = currentBalance + amount;
        transaction.update(docRef.ref, { satoshiBalance: newBalance }); // Atualiza apenas o campo satoshiBalance
      } else {
        newBalance = amount;
        transaction.set(docRef.ref, { satoshiBalance: newBalance });
      }
      return newBalance;
    }));
  }
}//fim

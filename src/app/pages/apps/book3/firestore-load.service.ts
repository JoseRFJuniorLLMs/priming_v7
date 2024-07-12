// src/app/services/firestore-load.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreLoadService {
  constructor(private firestore: AngularFirestore) {}

  loadStoriesToFirestore(stories: any[]): Observable<void> {
    const batch = this.firestore.firestore.batch();

    stories.forEach(story => {
      const storyRef = this.firestore.collection('A0stories').doc().ref;
      batch.set(storyRef, story);
    });

    return new Observable(observer => {
      batch.commit()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { NoteCollection } from '../note/note-collection';
import { format } from 'date-fns';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataListService {

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');

  constructor(private firestore: Firestore, private afAuth: AngularFireAuth) {}

  getNotes(): Observable<NoteCollection[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const userNotesQuery = query(this.noteCollectionRef, where('student._id', '==', user.uid));
          return collectionData(userNotesQuery, { idField: '_id' }) as Observable<NoteCollection[]>;
        } else {
          return of<NoteCollection[]>([]);
        }
      })
    );
  }

  getNotesOfTheDay(): Observable<NoteCollection[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const notesOfDayQuery = query(
            this.noteCollectionRef,
            where('next_revision_date', '==', today),
            where('student._id', '==', user.uid)
          );
          return collectionData(notesOfDayQuery, { idField: '_id' }) as Observable<NoteCollection[]>;
        } else {
          return of<NoteCollection[]>([]);
        }
      })
    );
  }

  getNoteById(id: string): Observable<NoteCollection> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return docData(noteDocRef, { idField: '_id' }) as Observable<NoteCollection>;
  }

  updateNote(id: string, note: Partial<NoteCollection>): Promise<void> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return updateDoc(noteDocRef, note)
      .then(() => {
        console.log('Nota atualizada com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao atualizar a nota:', error);
      });
  }

  deleteNote(id: string): Promise<void> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return deleteDoc(noteDocRef)
      .then(() => {
        console.log('Nota excluída com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao excluir a nota:', error);
      });
  }
}

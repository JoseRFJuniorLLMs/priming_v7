import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { NoteCollection } from './note-collection';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');
  noteCollection$!: Observable<NoteCollection[]>;

  durationInSeconds = 90;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private firestore: Firestore,
    private _snackBar: MatSnackBar,
    private afAuth: AngularFireAuth
  ) {
    this.noteCollection$ = this.getNotes();
  }

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

  getNoteById(id: string): Observable<NoteCollection> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return docData(noteDocRef, { idField: '_id' }) as Observable<NoteCollection>;
  }

  createNote(note: NoteCollection): Promise<void> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          note.student = { _id: user.uid }; // Associa a nota ao usuário autenticado
          return addDoc(this.noteCollectionRef, { ...note }).then(() => {
            this.openSnackBar('Create Note OK !');
          });
        } else {
          return of(undefined);
        }
      })
    ).toPromise();
  }

  updateNote(id: string, note: Partial<NoteCollection>): Promise<void> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
          return updateDoc(noteDocRef, note).then(() => {
            this.openSnackBar('Update Note OK !');
          });
        } else {
          return of(undefined);
        }
      })
    ).toPromise();
  }

  deleteNote(id: string): Promise<void> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
          return deleteDoc(noteDocRef).then(() => {
            this.openSnackBar('Delete Note OK !');
          });
        } else {
          return of(undefined);
        }
      })
    ).toPromise();
  }

  private isTimestamp(value: any): value is Timestamp {
    return (
      value &&
      typeof value.seconds === 'number' &&
      typeof value.nanoseconds === 'number'
    );
  }

  formatNoteDate(note: NoteCollection): NoteCollection {
    if (note.created_at) {
      if (this.isTimestamp(note.created_at)) {
        note.created_at = new Date(note.created_at.seconds * 1000).toISOString();
      } else if (typeof note.created_at === 'string') {
        note.created_at = new Date(note.created_at).toISOString();
      }
    }
    return note;
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });
  }
}

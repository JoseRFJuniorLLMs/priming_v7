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
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { NoteCollection } from './note-collection';
import { Student } from '../student/form/student';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');
  private studentCollectionRef = collection(this.firestore, 'StudentCollection');
  noteCollection$!: Observable<NoteCollection[]>;

  durationInSeconds = 90;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private firestore: Firestore,
    private _snackBar: MatSnackBar
  ) {
    this.noteCollection$ = this.getNotes();
  }

  getNotes(): Observable<NoteCollection[]> {
    return collectionData(this.noteCollectionRef, {
      idField: '_id'
    }) as Observable<NoteCollection[]>;
  }

  getNoteById(id: string): Observable<NoteCollection> {
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return docData(noteDocRef, {
      idField: '_id'
    }) as Observable<NoteCollection>;
  }

  getStudentById(id: string): Observable<Student | any> {
    if (!id) return of(undefined);
    const studentDocRef = doc(this.firestore, `StudentCollection/${id}`);
    return docData(studentDocRef, {
      idField: '_id'
    }) as Observable<Student>;
  }

  createNote(note: NoteCollection): Promise<void> {
    this.openSnackBar('Create Note OK !');
    return addDoc(this.noteCollectionRef, { ...note }).then(() => {});
  }

  updateNote(id: string, note: Partial<NoteCollection>): Promise<void> {
    this.openSnackBar('Update Note OK !');
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return updateDoc(noteDocRef, note);
  }

  deleteNote(id: string): Promise<void> {
    this.openSnackBar('Delete Note OK !');
    const noteDocRef = doc(this.firestore, `NoteCollection/${id}`);
    return deleteDoc(noteDocRef);
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

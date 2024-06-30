import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { NoteCollection } from '../note/note-collection';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DataListService {

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');

  constructor(private firestore: Firestore) {}

  getNotes(): Observable<NoteCollection[]> {
    return collectionData(this.noteCollectionRef, { idField: '_id' }) as Observable<NoteCollection[]>;
  }

  getNotesOfTheDay(): Observable<NoteCollection[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const notesOfDayQuery = query(this.noteCollectionRef, where('next_revision_date', '==', today));
    return collectionData(notesOfDayQuery, { idField: '_id' }) as Observable<NoteCollection[]>;
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

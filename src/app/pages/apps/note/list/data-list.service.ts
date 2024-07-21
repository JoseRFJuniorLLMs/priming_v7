import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, updateDoc, deleteDoc, query, where, getDocs, writeBatch } from '@angular/fire/firestore';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { NoteCollection } from '../../note/note-collection';
import { format, subDays } from 'date-fns';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataListService {

  private noteCollectionRef = collection(this.firestore, 'NoteCollection');
  private _totalNotesOfTheDay: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  get totalNotesOfTheDay$(): Observable<number> {
    return this._totalNotesOfTheDay.asObservable();
  }

  constructor(private firestore: Firestore, private afAuth: AngularFireAuth) {
    // Atualiza a contagem de notas do dia e notas atrasadas quando o serviço é instanciado
    this.updateOverdueNotes().then(() => this.updateTotalNotesOfTheDay());
  }

  getNotes(): Observable<NoteCollection[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const userNotesQuery = query(
            this.noteCollectionRef,
            where('student._id', '==', user.uid),
            where('permanent', '==', false)
          );
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
            where('student._id', '==', user.uid),
            where('permanent', '==', false)
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
        // Atualiza as contagens após a atualização da nota
        this.updateTotalNotesOfTheDay();
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
        // Atualiza as contagens após a exclusão da nota
        this.updateTotalNotesOfTheDay();
      })
      .catch(error => {
        console.error('Erro ao excluir a nota:', error);
      });
  }

  getTotalNotesOfTheDay(): Observable<number> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const notesOfDayQuery = query(
            this.noteCollectionRef,
            where('next_revision_date', '==', today),
            where('student._id', '==', user.uid),
            where('permanent', '==', false)
          );
          return getDocs(notesOfDayQuery).then(querySnapshot => {
            return querySnapshot.size;
          });
        } else {
          return of(0);
        }
      })
    );
  }

  updateTotalNotesOfTheDay(): void {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log('Atualizando total de notas do dia para:', today); // Log para verificar a execução
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const notesOfDayQuery = query(
            this.noteCollectionRef,
            where('next_revision_date', '==', today),
            where('student._id', '==', user.uid),
            where('permanent', '==', false)
          );
          return getDocs(notesOfDayQuery).then(querySnapshot => {
            console.log('Notas do dia:', querySnapshot.size); // Log para verificar o resultado da consulta
            this._totalNotesOfTheDay.next(querySnapshot.size);
          });
        } else {
          this._totalNotesOfTheDay.next(0);
          return Promise.resolve();
        }
      })
    ).subscribe();
  }

  updateOverdueNotes(): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    //const fifteenDaysAgo = format(subDays(new Date(), 15), 'yyyy-MM-dd');
    console.log('Atualizando notas atrasadas para a data de hoje:', today); // Log para verificar a execução
    return this.afAuth.authState.pipe(
      switchMap(async user => {
        if (user && user.uid) {
          const overdueNotesQuery = query(
            this.noteCollectionRef,
            where('next_revision_date', '<', today),
            where('student._id', '==', user.uid),
            where('permanent', '==', false)
          );
  
          const querySnapshot = await getDocs(overdueNotesQuery);
          const batch = writeBatch(this.firestore);
  
          querySnapshot.forEach(doc => {
            batch.update(doc.ref, { next_revision_date: today });
          });
  
          return batch.commit().then(() => {
            console.log('Notas atrasadas atualizadas com sucesso!'); // Log para verificar sucesso
          }).catch(error => {
            console.error('Erro ao atualizar as notas atrasadas:', error);
          });
        } else {
          return Promise.resolve();
        }
      })
    ).toPromise();
  }
  
  // Novo método para buscar notas permanentes
  getPermanentNotes(): Observable<NoteCollection[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && user.uid) {
          const permanentNotesQuery = query(
            this.noteCollectionRef,
            where('student._id', '==', user.uid),
            where('permanent', '==', true)
          );
          return collectionData(permanentNotesQuery, { idField: '_id' }) as Observable<NoteCollection[]>;
        } else {
          return of<NoteCollection[]>([]);
        }
      })
    );
  }
}

import { DataSource } from '@angular/cdk/table';
import { NoteCollection } from './note-collection';
import { Observable } from 'rxjs';

export class NoteDataSource extends DataSource<NoteCollection> {
  data: NoteCollection[] = [];

  constructor(private noteCollection$: Observable<NoteCollection[]>) {
    super();
  }

  connect(): Observable<NoteCollection[]> {
    return this.noteCollection$;
  }

  disconnect(): void {}
}

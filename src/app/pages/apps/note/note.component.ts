import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { NoteService } from './note.service';
import { NoteCollection } from './note-collection';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Student } from '../student/form/student';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { VoiceRecognitionService } from '../../../pages/apps/voice-comand/voice-recognition.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FlashcardComponent } from '../list/flashcard.component';

@Component({
  selector: 'notes',
  standalone: true,
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    DragDropModule,
    MatTooltipModule,
    FormsModule
  ]
})
export class NoteComponent implements OnInit {
  noteCollection$ = new Observable<NoteCollection[]>();
  layoutCtrl: any;
  dataSource = new MatTableDataSource<NoteCollection>();
  searchValue: string = '';

  notes$!: Observable<NoteCollection[]>;
  filteredNotes$!: Observable<NoteCollection[]>;
  searchTerm: string = '';

  constructor(
    public dialog: MatDialog,
    @Inject(Firestore) private firestore: Firestore,
    private noteService: NoteService,
    private voiceService: VoiceRecognitionService 
  ) {}

  trackById(index: number, noteCollection: NoteCollection): string | number {
    return noteCollection._id;
  }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.noteService.noteCollection$
      .pipe(
        switchMap((notes) => {
          const studentObservables = notes.map((note) =>
            note.student?._id
              ? this.noteService.getStudentById(note.student._id).pipe(
                  map((student) => ({
                    ...note,
                    studentName: student?.name ?? 'Unknown',
                    student: student 
                  })),
                  catchError(() => of({ ...note, studentName: 'Unknown' }))
                )
              : of({ ...note, studentName: 'Unknown' })
          );

          return forkJoin(studentObservables);
        })
      )
      .subscribe((notesWithDetails) => {
        this.dataSource.data = notesWithDetails.map((noteData: any) => {
          const note = new NoteCollection(noteData);
          return this.noteService.formatNoteDate(note);
        });
      });
  }

  createNote(student: Student): void {
    const newNote = new NoteCollection({
      _id: '', // Generate a unique ID for the new note if necessary
      created_at: new Date().toISOString(),
      description: '',
      student: student,
      tags: '',
      title: '',
      permanent: false 
    });
    this.noteService
      .createNote(newNote)
      .then(() => {
        console.log('Note created successfully');
        this.loadNotes();
      })
      .catch((error) => {
        console.error('Error creating note:', error);
      });
  }

  updateNote(id: string, noteData: Partial<NoteCollection>): void {
    this.noteService
      .updateNote(id, noteData)
      .then(() => {
        console.log('Note updated successfully');
        this.loadNotes();
      })
      .catch((error) => {
        console.error('Error updating note:', error);
      });
  }

  deleteNote(id: string): void {
    this.noteService
      .deleteNote(id)
      .then(() => {
        console.log('Note deleted successfully');
        this.loadNotes();
      })
      .catch((error) => {
        console.error('Error deleting note:', error);
      });
  }

  togglePermanent(note: NoteCollection): void {
    const updatedNote = { ...note, permanent: !note.permanent };
    this.noteService
      .updateNote(note._id, updatedNote)
      .then(() => {
        console.log('Note updated successfully');
        this.loadNotes();
      })
      .catch((error) => {
        console.error('Error updating note:', error);
      });
  }

  convertToDate(dateString: string | undefined): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  drop(event: CdkDragDrop<NoteCollection[]>): void {
    const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
  }

  speak(note: NoteCollection): void {
    const text = `
      Title: ${note.title},
      Description: ${note.description},
      Tags: ${note.tags},
      Permanent: ${note.permanent ? 'Yes' : 'No'},
      Created at: ${this.convertToDate(note.created_at)?.toLocaleDateString() ?? 'Unknown'}
    `;
    console.log('Speaking note:', text);
    this.voiceService.speak(text);
  }

  // Method to review a note
  reviewNote(note: NoteCollection, correctAnswer: boolean): void {
    // A lógica do review foi simplificada para chamar calculateNextReview diretamente
    const response = correctAnswer ? 'good' : 'fail';
    note.calculateNextReview(response);
    this.updateNote(note._id, note);
  }

  // Removido o método que causava erro

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openFlashcard(): void {
    this.filteredNotes$.subscribe(notes => {
      const dialogRef = this.dialog.open(FlashcardComponent, {
        width: '80vw',  // 80% da largura da viewport
        height: '80vh', // 80% da altura da viewport
        data: { notes },
        hasBackdrop: false
      });
  
      dialogRef.afterClosed().subscribe(result => {
        // Chamando ngOnDestroy manualmente para garantir a limpeza
        if (dialogRef.componentInstance) {
          dialogRef.componentInstance.ngOnDestroy();
        }
      });
    });
  }

  ngOnDestroy(): void {

  }

}

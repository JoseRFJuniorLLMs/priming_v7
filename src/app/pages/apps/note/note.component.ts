import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { NoteService } from './note.service';
import { NoteCollection } from './note-collection';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { VoiceRecognitionService } from '../../../pages/apps/voice-comand/voice-recognition.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { FlashcardComponent } from '../note/list/flashcard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'notes',
  standalone: true,
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatTooltipModule,
    FormsModule
  ]
})
export class NoteComponent implements OnInit {
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
    this.notes$ = this.noteService.noteCollection$;
    this.notes$.subscribe(notes => {
      console.log('Loaded notes:', notes); // Adicionando logs para verificar se as notas foram carregadas
    });
  }

  createNote(): void {
    const newNote = new NoteCollection({
      _id: '', // Generate a unique ID for the new note if necessary
      created_at: new Date().toISOString(),
      description: '',
      student: { _id: '123' }, // Exemplo de estudante
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
    console.log('Drop event:', event);
    this.notes$.subscribe(notes => {
      const prevIndex = notes.findIndex((d) => d === event.item.data);
      moveItemInArray(notes, prevIndex, event.currentIndex);
    });
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

  reviewNote(note: NoteCollection, correctAnswer: boolean): void {
    const response = correctAnswer ? 'good' : 'fail';
    note.calculateNextReview(response);
    this.updateNote(note._id, note);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();
  }

  openFlashcard(): void {
    this.notes$.subscribe(notes => {
      const dialogRef = this.dialog.open(FlashcardComponent, {
        width: '80vw',
        height: '80vh',
        data: { notes },
        hasBackdrop: false
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (dialogRef.componentInstance) {
          dialogRef.componentInstance.ngOnDestroy();
        }
      });
    });
  }

  ngOnDestroy(): void {
    // Implementa a lógica necessária para limpar recursos, se necessário
  }
}

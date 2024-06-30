import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { NoteService } from './note.service';
import { NoteCollection } from './note-collection';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { SoundService } from 'src/app/layouts/components/footer/sound.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'noteinsert',
  standalone: true,
  templateUrl: './noteinsert.component.html',
  styleUrls: ['./noteinsert.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    DragDropModule,
    FormsModule,
    RouterModule,
    MatTooltipModule,
    MatSelectModule
  ]
})
export class NoteinsertComponent implements OnInit, AfterViewInit {
  noteCollection$ = new Observable<NoteCollection[]>();
  layoutCtrl: any;
  dataSource = new MatTableDataSource<NoteCollection>();
  searchTerm: string = ''; // Campo para armazenar o termo de pesquisa

  newNote: NoteCollection = new NoteCollection({
    _id: '',
    created_at: new Date().toISOString(),
    description: '',
    student: undefined,
    tags: '',
    title: '',
    permanent: false
  });
  newTag: string = '';

  @ViewChild('descriptionInput') descriptionInput!: ElementRef;

  constructor(
    public dialog: MatDialog,
    @Inject(Firestore) private firestore: Firestore,
    private noteService: NoteService,
    private soundService: SoundService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.descriptionInput.nativeElement.focus();
    this.pasteFromClipboard();
    this.soundService.playToc();
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.newNote.description = text;
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  createNote(): void {
    if (!this.newNote.title || !this.newNote.description) {
      console.error('Title and description are required');
      return;
    }
  
    if (!this.newNote.tags || this.newNote.tags.length === 0) {
      console.error('At least one tag is required');
      return;
    }
  
    this.newNote._id = uuidv4();
    this.newNote.created_at = new Date().toISOString();
  
    const noteToSave: Partial<NoteCollection> = {
      _id: this.newNote._id,
      created_at: this.newNote.created_at,
      description: this.newNote.description,
      title: this.newNote.title,
      tags: this.newNote.tags,
      permanent: this.newNote.permanent,
      answer: this.newNote.answer || '',
      last_revision_date: this.newNote.last_revision_date || '',
      next_revision_date: this.newNote.next_revision_date || '',
      level: this.newNote.level || '',
      image: this.newNote.image || '',
    };
  
    if (this.newNote.student && this.newNote.student._id) {
      noteToSave.student = this.newNote.student;
    }
  
    this.noteService
      .createNote(noteToSave as NoteCollection)
      .then(() => {
        console.log('Note created successfully');
        this.resetForm(); // Reset the form after creating a note
      })
      .catch((error) => {
        console.error('Error creating note:', error);
      });
  }
  
  resetForm(): void {
    this.newNote = new NoteCollection({
      _id: '',
      created_at: new Date().toISOString(),
      description: '',
      student: undefined,
      tags: '',
      title: '',
      permanent: false,
      answer: '',
      last_revision_date: '',
      next_revision_date: '',
      level: '',
      image: ''
    });
    this.newTag = '';
  }
     
  convertToDate(dateString: string | undefined): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  drop(event: CdkDragDrop<NoteCollection[]>): void {
    const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
  }
}

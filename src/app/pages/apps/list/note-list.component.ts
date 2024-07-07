import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Adicione esta importação
import { DataListService } from './data-list.service';
import { NoteCollection } from '../note/note-collection';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge'; 
import { FlashcardComponent } from './flashcard.component';
import { NoteDialogComponent } from './note-dialog.component';
import { VoiceCardRecognitionService } from './voice-card-recognition.service';
import { RsvpreaderComponent } from '../../dashboards/components/dialog-rsvpreader/rsvpreader.component';

@Component({
  selector: 'note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatBadgeModule 
  ]
})
export class NoteListComponent implements OnInit, OnDestroy {

  notes$!: Observable<NoteCollection[]>;
  filteredNotes$!: Observable<NoteCollection[]>;
  totalNotes$: Observable<number>; 
  searchTerm: string = '';
  private flashcardDialogRef: any;
  private srvpDialogRef: any;

  constructor(
    private dataListService: DataListService, 
    public dialog: MatDialog,
    private voiceRecognitionService: VoiceCardRecognitionService
  ) {
    this.totalNotes$ = this.dataListService.getTotalNotesOfTheDay(); 
  }

  ngOnInit(): void {
    this.notes$ = this.dataListService.getNotes();
    this.filteredNotes$ = this.notes$;
  }

  ngOnDestroy(): void {
    if (this.voiceRecognitionService && this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
    // Adicione qualquer outra limpeza necessária aqui
  }

  searchNotes(): void {
    this.filteredNotes$ = this.notes$.pipe(
      map((notes: NoteCollection[]) => notes.filter((note: NoteCollection) => note.title?.toLowerCase().includes(this.searchTerm.toLowerCase())))
    );
  }

  editNote(note: NoteCollection): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '80vw',  // 80% da largura da viewport
      height: '80vh', // 80% da altura da viewport
      data: note
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataListService.updateNote(note._id, result);
      }
    });
  }

  deleteNote(id: string): void {
    this.dataListService.deleteNote(id);
  }

  openFlashcard(): void {
    this.filteredNotes$.subscribe(notes => {
      if (!this.flashcardDialogRef) {
        this.flashcardDialogRef = this.dialog.open(FlashcardComponent, {
          width: '80vw',
          height: '80vh',
          data: { notes },
          hasBackdrop: false
        });

        this.flashcardDialogRef.afterClosed().subscribe(() => {
          this.flashcardDialogRef = null;
        });
      } else {
        this.flashcardDialogRef.componentInstance.updateNotes(notes);
      }
    });
  }

  openSRVP(): void {
    this.filteredNotes$.subscribe(notes => {
      const combinedText = notes.map(note => note.description).join(' '); // Concatena as descrições das notas
      if (!this.srvpDialogRef) {
        this.srvpDialogRef = this.dialog.open(RsvpreaderComponent, {
          width: '80vw',
          height: '80vh',
          data: { texto: combinedText }, // Passa o texto combinado para o componente `RsvpreaderComponent`
          hasBackdrop: false
        });
  
        this.srvpDialogRef.afterClosed().subscribe(() => {
          this.srvpDialogRef = null;
        });
      }
    });
  }
}

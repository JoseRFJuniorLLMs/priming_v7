import { Component, Inject, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoteCollection } from '../note/note-collection';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VoiceCardRecognitionService } from './voice-card-recognition.service';
import { DataListService } from './data-list.service';
import { format } from 'date-fns';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ],
  providers: [DataListService]
})
export class FlashcardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waveform') waveformElement!: ElementRef;

  currentNoteIndex: number = 0;
  showTranslation: boolean = false;
  notesOfTheDay: NoteCollection[] = [];
  reviewCompleted: boolean = false;
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;
  audioAvailable = false;

  constructor(
    public dialogRef: MatDialogRef<FlashcardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notes: NoteCollection[] },
    private dataService: DataListService,
    private voiceRecognitionService: VoiceCardRecognitionService
  ) {
    console.log('FlashcardComponent initialized');
    this.loadNotesOfTheDay();
    this.loadVoices();
  }
  
  get currentNote(): NoteCollection {
    return this.notesOfTheDay[this.currentNoteIndex];
  }

  loadNotesOfTheDay(): void {
    this.dataService.getNotesOfTheDay().subscribe({
      next: (notes: NoteCollection[]) => {
        this.notesOfTheDay = notes.map(note => new NoteCollection(note));
        console.log('Notes of the day loaded:', this.notesOfTheDay);
        if (this.notesOfTheDay.length > 0) {
          this.currentNoteIndex = 0;
        } else {
          this.reviewCompleted = true;
        }
      },
      error: (error) => {
        console.error('Error loading notes of the day:', error);
      }
    });
  }

  loadVoices(): void {
    const synth = window.speechSynthesis;
    this.voices = synth.getVoices();
    if (this.voices.length === 0) {
      synth.onvoiceschanged = () => {
        this.voices = synth.getVoices();
      };
    }
  }

  ngOnInit() {
    this.audioAvailable = this.checkAudioAvailability();
  }
  
  checkAudioAvailability(): boolean {
    return true; 
  }

  ngAfterViewInit(): void {
    if (this.voiceRecognitionService) {
      console.log('Setting up WaveSurfer');
      this.voiceRecognitionService.setupWaveSurfer(this.waveformElement);
    } else {
      console.error('voiceRecognitionService is not initialized');
    }
  }
  
  ngOnDestroy(): void {
    if (this.voiceRecognitionService && this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.destroy();
    }
  }

  toggleTranslation(): void {
    this.showTranslation = !this.showTranslation;
    console.log('Translation toggled:', this.showTranslation);
    
    if (this.currentNote && this.currentNote.description) {
      console.log('Attempting to speak and visualize:', this.currentNote.description);
      this.voiceRecognitionService.speakAndVisualize(this.currentNote.description, this.waveformElement, this.selectedVoice);
    } else {
      console.log('Not speaking. currentNote:', this.currentNote);
    }
  }

  showNextNote(): void {
    this.showTranslation = false;
    this.currentNoteIndex++;
    if (this.currentNoteIndex >= this.notesOfTheDay.length) {
      this.reviewCompleted = true;
    } else {
      console.log('Next note index:', this.currentNoteIndex);
    }
  }

  showTranslationAndSpeak(): void {
    this.showTranslation = true;
    if (this.currentNote && this.currentNote.answer) {
      //TO DO: 
    }
  }

  answer(response: 'fail' | 'hard' | 'good' | 'easy'): void {
    console.log('Answer given:', response);
    this.updateNoteReviewDate(response);
    this.showNextNote();
  }

  updateNoteReviewDate(response: 'fail' | 'hard' | 'good' | 'easy'): void {
    const note = this.currentNote;
    const today = new Date();

    note.last_revision_date = format(today, 'yyyy-MM-dd');
    console.log('Note before calculateNextReview:', note);

    if (typeof note.calculateNextReview === 'function') {
      note.calculateNextReview(response);
    } else {
      console.error('calculateNextReview is not a function');
    }

    this.dataService.updateNote(note._id, {
      last_revision_date: note.last_revision_date,
      next_revision_date: note.next_revision_date
    }).then(() => {
      console.log('Note updated:', note);
    }).catch(error => {
      console.error('Error updating note:', error);
    });
  }

  onVoiceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedVoiceName = selectElement.value;
    this.selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName) || null;
  }

  playAudio(): void {
    if (this.voiceRecognitionService.wavesurfer) {
      this.voiceRecognitionService.wavesurfer.playPause();
    }
  }

  closeClick(): void {
    this.dialogRef.close();
  }
}

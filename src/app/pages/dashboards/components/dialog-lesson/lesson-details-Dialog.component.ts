import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lesson } from 'src/app/model/lesson/lesson';

@Component({
  selector: 'app-lesson-details-dialog',
  template: `
    <h1 mat-dialog-title>Detalhes das Lições</h1>
    <div mat-dialog-content>
      <ul>
        <li *ngFor="let lesson of data.lessons">
          {{ lesson.title }} - {{ lesson.description }}
        </li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Fechar</button>
    </div>
  `,
})
export class LessonDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { lessons: Lesson[] }) {}
}

import { Injectable } from '@angular/core';
import textCollection from '../../../../assets/json/TextCollection_classified.json';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { TextItem } from './text-item.interface';  

@Injectable({
  providedIn: 'root'
})
export class DatatextService {
  durationInSeconds = 90;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) {}

  getAllTexts(): Observable<TextItem[]> {
    const typedTextCollection = textCollection as TextItem[];
    return of(typedTextCollection);
  }

  getTextByIndex(index: number): Observable<TextItem | null> {
    const typedTextCollection = textCollection as TextItem[];
    if (index >= 0 && index < typedTextCollection.length) {
      return of(typedTextCollection[index]);
    } else {
      return of(null);
    }
  }

  getTextsByPage(page: number, size: number): Observable<TextItem[]> {
    const typedTextCollection = textCollection as TextItem[];
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return of(typedTextCollection.slice(startIndex, endIndex));
  }

  getFilteredTextsByPage(page: number, size: number, level: string): Observable<TextItem[]> {
    const typedTextCollection = textCollection as TextItem[];
    const filteredCollection = typedTextCollection.filter(text => text.level === level);
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return of(filteredCollection.slice(startIndex, endIndex));
  }

  getUniqueLevels(): Observable<string[]> {
    const typedTextCollection = textCollection as TextItem[];
    const levels = [...new Set(typedTextCollection.map(text => text.level))];
    return of(levels);
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: this.durationInSeconds * 1000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });
  }
}

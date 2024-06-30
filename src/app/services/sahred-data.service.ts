import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private selectedTextSource = new BehaviorSubject<string>('');
  selectedText$ = this.selectedTextSource.asObservable();

  setSelectedText(text: string) {
    this.selectedTextSource.next(text);
  }
}

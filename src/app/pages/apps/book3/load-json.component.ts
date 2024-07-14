import { Component } from '@angular/core';
import { FirestoreLoadService } from './firestore-load.service';
//import stories from '../../../../assets/json/TextCollection_classifiedA0.json'; 
import stories from '../../../../assets/json/TextCollection_classified.json';

@Component({
  selector: 'app-load-json',
  templateUrl: './load-json.component.html',
  styleUrls: ['./load-json.component.css']
})
export class LoadJsonComponent {
  constructor(private firestoreLoadService: FirestoreLoadService) {}

  loadJson() {
    this.firestoreLoadService.loadStoriesToFirestore(stories).subscribe({
      next: () => console.log('Stories loaded successfully'),
      error: (err) => console.error('Error loading stories:', err)
    });
  }
}

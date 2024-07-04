import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clear-calls',
  templateUrl: './clear-calls.component.html',
  styleUrls: ['./clear-calls.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class ClearCallsComponent {

  constructor(private firestore: AngularFirestore) { }

  async clearCallsAndSetOffline() {
    try {
      // Limpar todas as chamadas
      const callsCollection = this.firestore.collection('calls');
      const callsSnapshot = await callsCollection.get().toPromise();
      const batch = this.firestore.firestore.batch();

      callsSnapshot?.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Mudar status de todos os alunos para offline
      const studentsCollection = this.firestore.collection('students');
      const studentsSnapshot = await studentsCollection.get().toPromise();

      studentsSnapshot?.forEach(doc => {
        batch.update(doc.ref, { online: false });
      });

      await batch.commit();
      console.log('Todas as chamadas foram limpas e todos os alunos foram definidos como offline.');
    } catch (error) {
      console.error('Erro ao limpar chamadas e definir alunos como offline:', error);
    }
  }
}

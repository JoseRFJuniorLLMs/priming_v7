import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Student } from 'src/app/model/student/student';
import { StudentService } from 'src/app/pages/apps/student/student.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginErrorSubject = new BehaviorSubject<string | null>(null);
  loginError$ = this.loginErrorSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private studentService: StudentService
  ) {}

  async register(email: string, password: string, studentData: Omit<Student, '_id' | 'email'>) {
    try {
      console.log('Registering user with email:', email);
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (!user || !user.uid || !user.email) {
        throw new Error('User or user email not found.');
      }

      const student: Student = {
        _id: user.uid,
        email: user.email,
        ...studentData,
        online: true // Setting online status to true at registration
      };

      console.log('Adding student data to Firestore:', student);
      await this.studentService.addStudentData(student);
      console.log('Student data added successfully');
      this.router.navigate(['/dashboards/analytics']);
    } catch (error) {
      console.error('Error during registration:', error);
      this.loginErrorSubject.next('Registration failed. Please try again.');
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('Logging in user with email:', email);
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (user && user.uid) {
        // Verifica se o documento do usuário existe e atualiza o campo online
        const userDoc = this.firestore.collection('students').doc(user.uid);
        const userDocSnapshot = await userDoc.get().toPromise();
        if (userDocSnapshot && userDocSnapshot.exists) {
          await userDoc.update({ online: true });
        } else {
          await userDoc.set({ online: true }, { merge: true });
        }
      }
      this.loginErrorSubject.next(null); // Clear any previous error
      this.router.navigate(['/dashboards/analytics']); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Error during login:', error);
      this.loginErrorSubject.next('Incorrect email or password.'); // Set error message
    }
  }

  async logout() {
    try {
      const user = await this.afAuth.currentUser;
      if (user && user.uid) {
        // Atualiza o status do usuário para offline
        await this.firestore.collection('students').doc(user.uid).update({ online: false });
      }
      console.log('Logging out user');
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }

  // Método para obter o usuário atual
  async getCurrentUser() {
    return this.afAuth.currentUser;
  }
}

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

  async register(email: string, password: string, studentData: Omit<Student, '_id'>) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const student: Student = {
        _id: userCredential.user!.uid,
        email: userCredential.user!.email!,
        ...studentData
      };
      await this.studentService.addStudentData(student);
      this.router.navigate(['/dashboards/analytics']);
    } catch (error) {
      console.error('Error during registration: ', error);
      this.loginErrorSubject.next('Registration failed. Please try again.');
    }
  }

  async login(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.loginErrorSubject.next(null); // Clear any previous error
      this.router.navigate(['/dashboards/analytics']); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Error during login: ', error);
      this.loginErrorSubject.next('Incorrect email or password.'); // Set error message
    }
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout: ', error);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }
}

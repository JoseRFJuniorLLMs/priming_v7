import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginErrorSubject = new BehaviorSubject<string | null>(null);
  loginError$ = this.loginErrorSubject.asObservable();

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async register(email: string, password: string) {
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during registration: ', error);
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

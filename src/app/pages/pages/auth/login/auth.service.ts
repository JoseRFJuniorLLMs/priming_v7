import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Student } from 'src/app/model/student/student';
import { ChatVideoService } from 'src/app/pages/apps/chat-video/chat-video.service';
import { StudentService } from 'src/app/pages/apps/student/student.service';
import { NotificationService } from 'src/app/pages/apps/chat-video/notification.service';
import firebase from 'firebase/compat/app';
import { DataListService } from 'src/app/pages/apps/note/list/data-list.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginErrorSubject = new BehaviorSubject<string | null>(null);
  loginError$ = this.loginErrorSubject.asObservable();
  
  private userNameSubject = new BehaviorSubject<string | null>(null);
  userName$ = this.userNameSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private chatVideoService: ChatVideoService,
    private studentService: StudentService,
    private notificationService: NotificationService,
    private dataListService: DataListService 
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
        online: true
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
        const userDoc = this.firestore.collection('students').doc(user.uid);
        const userDocSnapshot = await userDoc.get().toPromise();
        const currentTimestamp = new Date().toISOString();
        
        if (userDocSnapshot && userDocSnapshot.exists) {
          await userDoc.update({ 
            online: true,
            lastLogin: currentTimestamp,
            loginHistory: firebase.firestore.FieldValue.arrayUnion(currentTimestamp)
          });
          const userData = userDocSnapshot.data() as Student;
          this.userNameSubject.next(userData.name ?? null);
        } else {
          await userDoc.set({ 
            online: true, 
            lastLogin: currentTimestamp,
            loginHistory: [currentTimestamp]
          }, { merge: true });
        }
  
        this.notificationService.listenForCallNotifications(user.uid);
  
        // Initialize WebRTC for the user, set up the connection and create an offer
        await this.chatVideoService.startLocalStream();
        await this.chatVideoService.setupWebRTCForUser(user.uid);
        await this.chatVideoService.createOffer(user.uid);
  
        // Atualiza as notas atrasadas após o login
        setTimeout(() => {
          this.dataListService.updateOverdueNotes()
            .then(() => console.log('Notas atrasadas atualizadas com sucesso após o login.'))
            .catch(error => console.error('Erro ao atualizar as notas atrasadas após o login:', error));
        }, 0);
      }
      this.loginErrorSubject.next(null);
      this.router.navigate(['/dashboards/analytics']);
    } catch (error) {
      console.error('Error during login:', error);
      this.loginErrorSubject.next('Incorrect email or password.');
    }
  }
  
  async logout() {
    try {
      const user = await this.afAuth.currentUser;
      if (user && user.uid) {
        await this.firestore.collection('students').doc(user.uid).update({ online: false });
        await this.chatVideoService.tearDownWebRTCForUser(user.uid);
        await this.chatVideoService.deleteCallInfo();
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

  async getCurrentUser(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }
  
  async getUID(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }


}//fim

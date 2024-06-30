import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../pages/auth/login/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    city: [''],
    country: [''],
    courses: [''],
    gender: [''],
    phone: ['']
    // adicione outros campos conforme necessário
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  async register() {
    if (this.form.valid) {
      const { email, password, ...studentData } = this.form.value;
      try {
        await this.authService.register(email, password, studentData);
        this.snackbar.open('Registration successful!', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Registration error:', error);
        this.snackbar.open('Registration failed. Please try again.', 'Close', { duration: 5000 });
      }
    } else {
      this.snackbar.open('Please fill out the form correctly.', 'Close', { duration: 3000 });
    }
  }
}

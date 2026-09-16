import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SnackbarComponent } from '../../shared/snackbar/snackbar.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SnackbarComponent],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  snackbar = inject(SnackbarService);

  email = '';
  password = '';

  isLoading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  togglePassword() { this.showPassword.update(v => !v); }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please enter email and password.');
      return;
    }

    const adminEmails = ['admin@fruitchat.com', 'fruitchat.admin@gmail.com'];
    if (!adminEmails.includes(this.email)) {
      this.errorMsg.set('Access denied. Not an admin account.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.snackbar.show('Logged in successfully!', 'success');
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.message || 'Login failed.';
      this.errorMsg.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}

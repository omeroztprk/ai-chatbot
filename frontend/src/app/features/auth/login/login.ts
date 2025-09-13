import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.getRawValue() as LoginRequest;

    this.auth.login({ email, password }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => this.error.set(e?.error?.error || 'Login failed')
    });
  }
}
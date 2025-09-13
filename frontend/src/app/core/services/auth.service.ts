import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly K = {
    access: 'accessToken',
    user: 'currentUser'
  };

  private readonly userSig = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  currentUserSig = this.userSig;
  userFullName = computed(() => {
    const u = this.userSig();
    return u ? (u.fullName ?? `${u.firstName} ${u.lastName}`) : '';
  });

  constructor(private http: HttpClient) {
    this.restore();
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res.token && res.user) {
          this.applyAuth(res.user, res.token);
        }
      })
    );
  }

  logout(): Observable<void> {
    const hasToken = !!this.getAccessToken();
    return (hasToken ? this.http.post<void>(`${this.apiUrl}/logout`, {}) : of(void 0)).pipe(
      tap(() => this.clear())
    );
  }

  applyAuth(user: User, at: string): void {
    localStorage.setItem(this.K.access, at);
    localStorage.setItem(this.K.user, JSON.stringify(user));
    this.userSig.set(user);
    this.isAuthenticated.set(true);
  }

  clear(): void {
    localStorage.removeItem(this.K.access);
    localStorage.removeItem(this.K.user);
    this.userSig.set(null);
    this.isAuthenticated.set(false);
  }

  isAuth(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.userSig();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.K.access);
  }

  private restore() {
    const rawUser = localStorage.getItem(this.K.user);
    if (rawUser) {
      try { this.userSig.set(JSON.parse(rawUser)); } catch { this.clear(); return; }
    }
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      this.isAuthenticated.set(true);
    } else {
      this.clear();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.exp) return true;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

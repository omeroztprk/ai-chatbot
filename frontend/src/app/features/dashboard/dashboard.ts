import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { ChatMessage } from '../../core/models/chat.model';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements AfterViewInit {
  private auth = inject(AuthService);
  private chat = inject(ChatService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLTextAreaElement>;

  messages = signal<ChatMessage[]>([]);
  streaming = signal(false);
  error = signal<string | null>(null);
  private streamSub?: Subscription;

  chatForm: FormGroup = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1)]]
  });

  logout() {
    this.auth.logout()
      .pipe(finalize(() => this.router.navigate(['/auth/login'])))
      .subscribe();
  }

  onEnter(evt: Event) {
    const e = evt as KeyboardEvent;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onSubmit();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.resetTextareaHeight());
  }

  onSubmit() {
    if (this.chatForm.invalid || this.streaming()) return;
    const message = (this.chatForm.get('message')?.value || '').trim();
    if (!message) return;

    this.error.set(null);

    this.messages.update(list => [...list, { role: 'user', content: message, createdAt: new Date() }]);
    this.chatForm.reset();
    this.resetTextareaHeight();
    setTimeout(() => this.messageInput?.nativeElement.focus());
    this.scrollToBottomSoon();

    const assistantIndex = this.messages().length;
    this.messages.update(list => [...list, { role: 'assistant', content: '', createdAt: new Date() }]);

    this.streaming.set(true);

    this.streamSub = this.chat.stream(message).subscribe({
      next: (chunk) => {
        const arr = [...this.messages()];
        arr[assistantIndex] = { ...arr[assistantIndex], content: (arr[assistantIndex].content || '') + chunk };
        this.messages.set(arr);
        this.scrollToBottomSoon();
      },
      error: (err) => {
        this.streaming.set(false);
        this.error.set(err?.message || 'Chat failed');
      },
      complete: () => this.streaming.set(false)
    });
  }

  autoResize(evt?: Event) {
    const el = (evt?.target as HTMLTextAreaElement) || this.messageInput?.nativeElement;
    if (!el) return;

    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const brdY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const maxHeight = Math.round(line * 3 + padY + brdY);

    const newH = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newH}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private resetTextareaHeight() {
    const el = this.messageInput?.nativeElement;
    if (!el) return;
    el.value = '';
    el.style.height = '';
    el.style.overflowY = 'hidden';
  }

  cancel() {
    this.streamSub?.unsubscribe();
    this.streamSub = undefined;
    this.streaming.set(false);
  }

  private scrollToBottomSoon() {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}

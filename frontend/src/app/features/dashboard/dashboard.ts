import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit, HostListener } from '@angular/core';
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
  @ViewChild('extraInput') extraInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('menuRoot') menuRoot?: ElementRef<HTMLElement>;

  messages = signal<ChatMessage[]>([]);
  streaming = signal(false);
  error = signal<string | null>(null);
  private streamSub?: Subscription;

  menuOpen = signal(false);
  showExtraPrompt = signal(false);

  chatForm: FormGroup = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1)]],
    extraPrompt: ['']
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
    setTimeout(() => this.autoResize());
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }

  onSelectExtraPrompt() {
    this.showExtraPrompt.set(true);
    this.menuOpen.set(false);
    setTimeout(() => {
      const el = this.extraInput?.nativeElement;
      if (el) { this.autoResize({ target: el } as any); el.focus(); }
    });
  }

  closeExtraPrompt() {
    this.showExtraPrompt.set(false);
    setTimeout(() => this.messageInput?.nativeElement?.focus());
  }

  onSubmit() {
    if (this.chatForm.invalid || this.streaming()) return;
    const message = (this.chatForm.get('message')?.value || '').trim();
    const prompt = (this.chatForm.get('extraPrompt')?.value || '').trim();
    if (!message) return;

    this.error.set(null);

    this.messages.update(list => [...list, { role: 'user', content: message, createdAt: new Date() }]);
    this.chatForm.get('message')?.reset('');
    this.resetTextareaHeight();
    setTimeout(() => this.messageInput?.nativeElement.focus());
    this.scrollToBottomSoon();

    const assistantIndex = this.messages().length;
    this.messages.update(list => [...list, { role: 'assistant', content: '', createdAt: new Date() }]);

    this.streaming.set(true);

    this.streamSub = this.chat.stream(message, { prompt: prompt || undefined }).subscribe({
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

  onClearChat() {
    this.cancel();

    this.messages.set([]);
    this.error.set(null);

    this.menuOpen.set(false);
    setTimeout(() => this.messageInput?.nativeElement?.focus());

    this.scrollToBottomSoon();
  }

  autoResize(evt?: Event) {
    const el = (evt?.target as HTMLTextAreaElement) || this.messageInput?.nativeElement;
    if (!el) return;

    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const brdY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    const cssMinH = parseFloat(cs.minHeight) || 0;
    const minH = Math.max(cssMinH, Math.round(line + padY + brdY));
    const maxH = Math.round(line * 2 + padY + brdY);

    const target = Math.min(Math.max(el.scrollHeight, minH), maxH);
    el.style.height = `${target}px`;
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
  }

  private resetTextareaHeight() {
    const el = this.messageInput?.nativeElement;
    if (!el) return;
    el.value = '';
    el.style.height = 'auto';
    el.style.overflowY = 'hidden';
    requestAnimationFrame(() => this.autoResize());
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const menuEl = this.menuRoot?.nativeElement;
    if (!menuEl) return;
    const target = ev.target as Node;
    if (this.menuOpen() && !menuEl.contains(target)) {
      this.closeMenu();
    }
  }
}

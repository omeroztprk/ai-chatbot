import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChatService } from '../../core/services/chat.service';
import { ChatMessage } from '../../core/models/chat.model';

@Component({
    standalone: true,
    selector: 'app-chatbot',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './chatbot.html',
    styleUrls: ['./chatbot.scss']
})
export class ChatbotComponent implements AfterViewInit {
    private chat = inject(ChatService);
    private fb = inject(FormBuilder);

    @ViewChild('scroller') scroller?: ElementRef<HTMLDivElement>;
    @ViewChild('messageInput') messageInput?: ElementRef<HTMLTextAreaElement>;

    isOpen = signal(false);
    messages = signal<ChatMessage[]>([]);
    streaming = signal(false);
    private streamSub?: Subscription;

    chatForm: FormGroup = this.fb.group({
        message: ['', [Validators.required, Validators.minLength(1)]]
    });

    ngAfterViewInit() {
        setTimeout(() => this.autoResize());
    }

    toggle() {
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            setTimeout(() => this.messageInput?.nativeElement?.focus(), 100);
        }
    }

    close() {
        this.isOpen.set(false);
    }

    onEnter(evt: Event) {
        const e = evt as KeyboardEvent;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.onSubmit();
        }
    }

    onSubmit() {
        if (this.chatForm.invalid || this.streaming()) return;
        const message = (this.chatForm.get('message')?.value || '').trim();
        if (!message) return;

        this.messages.update(list => [...list, { role: 'user', content: message, createdAt: new Date() }]);
        this.chatForm.get('message')?.reset('');
        this.resetTextareaHeight();
        setTimeout(() => this.messageInput?.nativeElement?.focus());
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
                console.error('Chat error:', err);
            },
            complete: () => this.streaming.set(false)
        });
    }

    autoResize(evt?: Event) {
        const el = (evt?.target as HTMLTextAreaElement) || this.messageInput?.nativeElement;
        if (!el) return;

        el.style.height = 'auto';
        const cs = getComputedStyle(el);
        const line = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.4);
        const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const brdY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

        const minH = Math.round(line + padY + brdY);
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

    private scrollToBottomSoon() {
        setTimeout(() => {
            const el = this.scroller?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }

    cancel() {
        this.streamSub?.unsubscribe();
        this.streamSub = undefined;
        this.streaming.set(false);
    }
}
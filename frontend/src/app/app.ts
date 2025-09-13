import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './features/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}

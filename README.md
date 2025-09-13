# Chatbot Application

A full-stack chatbot application built with Angular frontend and Node.js/Express backend. Features user authentication, real-time chat streaming, and a modern responsive design with both main dashboard and floating chatbot widget interfaces.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Real-time Chat Streaming**: Server-sent events for live chatbot responses
- **Dual Interface**: Main dashboard chat and floating chatbot widget
- **Responsive Design**: Modern glass-morphism UI that works on all devices
- **Session Management**: Secure token-based authentication with session tracking
- **Auto-resizing Input**: Smart textarea that adapts to content length
- **Additional Prompts**: Optional extra instructions for enhanced chat context
- **Chat History**: Persistent conversation display with user/assistant message bubbles

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omeroztprk/chatbot.git
   cd chatbot
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend environment**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/chatbot
   JWT_SECRET=your_jwt_secret
   WEBHOOK_URL=your-webhook-url
   CORS_ORIGIN=http://localhost:4200
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Set up frontend environment**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```
   By default, the environment.ts file includes settings such as:
   ```ts
   export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api'
   };
   ```

## Running the Application

**Start the backend (Express API):**
```bash
npm run dev   # development mode with nodemon
npm start     # production mode
```

The backend will be available at http://localhost:3000.

**Start the frontend (Angular app):**
```bash
cd frontend
ng serve --open
```

The frontend will be available at http://localhost:4200.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# AURA: Academic Co-Pilot

[![Live Demo](https://img.shields.io/badge/Live%20Demo-auralabs.vercel.app-blue?style=flat-square)](https://auralabs.vercel.app/)

AURA is an AI-powered productivity and learning platform designed to help students excel. It combines chat-based Q&A, PDF summarization, flashcard generation, motivational quotes, and a task organizer in a modern, responsive web application.

## Live Demo
- 🌐 [https://auralabs.vercel.app/](https://auralabs.vercel.app/)

## Features
- **AI Chat**: Get instant answers to academic questions from an AI assistant.
- **PDF Summarizer**: Upload PDFs, extract text, and generate concise summaries.
- **Flashcards**: Automatically generate flashcards from notes or summaries.
- **Motivational Quotes**: Receive original, motivational quotes for students.
- **Task Organizer**: Manage academic tasks and deadlines.
- **Learning Space**: Organize and review learning materials.

## Tech Stack
- **Frontend**: Vite + React (JavaScript)
- **Backend**: Node.js + Express
- **Database**: Firebase
- **AI API**: OpenRouter
- **PDF Parsing**: External API (PDF.co) or local parsing (if supported)

## Project Structure
```
AURA/
  aura/      # Frontend (Vite + React)
  backend/   # Backend (Node.js + Express)
```

## Getting Started (Local Development)

### Prerequisites
- Node.js >= 18
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Bhuvilol/Portfolio.git
cd AURA
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your OpenRouter API key:
# OPENROUTER_API_KEY=sk-or-...
# (Optional for PDF parsing via PDF.co)
# PDFCO_API_KEY=your-pdfco-api-key
npm start
```

### 3. Frontend Setup
```bash
cd ../aura
npm install
# Create a .env file:
# VITE_BACKEND_URL=http://localhost:5000
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Usage
- **Live Demo**: Try the app at [https://auralabs.vercel.app/](https://auralabs.vercel.app/)
- **Chat**: Ask questions in the Chat section
- **PDF Summarizer**: Upload a PDF and get a summary
- **Flashcards**: Generate flashcards from notes or summaries
- **Quotes**: Get a new motivational quote on the dashboard
- **Tasks**: Organize your academic tasks

## Customization
- Update the OpenRouter model in `backend/server.js` to use a different AI model
- Add your Firebase config in `aura/src/firebase.js` to enable user authentication and data storage

## License
MIT

---

**AURA**: Your academic co-pilot for smarter learning ✨ 
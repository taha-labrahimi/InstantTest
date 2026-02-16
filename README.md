# Instant Test - AI-Powered JUnit Test Generator

An AI-powered web application that generates intelligent JUnit 5 tests from Java code using Google's Gemini API.

## 🎯 Features

- **Smart Test Generation**: Uses AI to understand your code and business logic
- **Edge Case Coverage**: Automatically tests nulls, empty collections, boundaries, exceptions, and concurrency
- **Context-Aware**: Add notes to guide test generation based on your requirements
- **Modern UI**: Split-screen interface with Monaco code editor
- **Export Options**: Copy to clipboard or download as `.java` file

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key (from Google AI Studio)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key in `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📖 How to Use

1. **Paste Java Code**: Copy your Java method or class into the left editor
2. **Add Context** (Optional): Describe business logic, constraints, or expected behavior
3. **Select Edge Cases**: Choose which scenarios to prioritize (all selected by default)
4. **Generate Tests**: Click the "Generate Tests" button
5. **Export**: Copy to clipboard or download the generated JUnit 5 test

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- Google Generative AI (Gemini 1.5 Flash)
- CORS for cross-origin requests

**Frontend:**
- React 18 + Vite
- TailwindCSS for styling
- Monaco Editor for code editing
- Lucide React for icons
- Axios for API calls

## 📁 Project Structure

```
Hackaton/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── generate.js        # API endpoint
│   ├── services/
│   │   ├── geminiService.js   # Gemini API integration
│   │   └── promptBuilder.js   # AI prompt construction
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.jsx           # Main application
│   │   └── main.jsx          # Entry point
│   └── package.json
└── README.md
```

## 🔧 API Endpoint

### POST `/api/generate`

**Request:**
```json
{
  "code": "public class UserService { ... }",
  "notes": "Should handle null IDs gracefully",
  "edgeCases": ["null", "empty", "boundary", "exception", "concurrent"]
}
```

**Response:**
```json
{
  "success": true,
  "testCode": "import org.junit.jupiter.api.Test; ...",
  "metadata": {
    "generatedAt": "2026-02-13T13:47:00Z",
    "model": "gemini-1.5-flash"
  }
}
```

## 🛡️ Security

- API key stored in `.env` file (never committed)
- Backend-only API access
- Input validation and size limits
- CORS enabled for local development

## 📝 License

MIT

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

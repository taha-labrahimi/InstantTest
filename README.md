# Instant Test - AI-Powered JUnit Test Generator

An AI-powered web application that generates intelligent JUnit 5 tests from Java code using Google's Gemini API.

## 🎯 Features

- **Smart Test Generation**: Uses AI to understand your code and business logic.
- **Edge Case Coverage**: Automatically tests nulls, empty collections, boundaries, exceptions, and concurrency.
- **Context-Aware**: Add notes to guide test generation based on your requirements.
- **Modern UI**: Split-screen interface with Monaco code editor.
- **Export Options**: Copy to clipboard or download as `.java` file.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key (from Google AI Studio)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API key in `.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install required dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   The user interface will be accessible at `http://localhost:5173`.

## 📁 Project Structure

```plaintext
Hackaton/
├── backend/
│   ├── server.js              # Express server initialization
│   ├── routes/
│   │   └── generate.js        # API endpoint orchestration
│   ├── services/
│   │   ├── geminiService.js   # LLM integration and retry logic
│   │   └── promptBuilder.js   # Logic-to-prompt transformation
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Modular React components
│   │   ├── App.jsx           # Application state and layout
│   │   └── main.jsx          # Frontend entry point
│   └── package.json
└── README.md
```

## � API Documentation

### POST `/api/generate`
Analyzes source code and generates a complete JUnit test class based on specified configurations.

**Request Schema:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `code` | String | **(Required)** The Java source code to analyze. |
| `notes` | String | **(Optional)** Business logic notes and method tags. |
| `casePriorities` | Object | **(Optional)** Priority levels for specific edge cases. |
| `pomInfo` | Object | **(Optional)** Project dependency metadata. |

**Example Response:**
```json
{
  "success": true,
  "testCode": "import org.junit.jupiter.api.Test; ...",
  "metadata": {
    "generatedAt": "2026-02-13T13:47:00Z",
    "model": "gemini-2.0-flash"
  }
}
```

## 🛡️ Security and Compliance

- **Credential Management**: API keys are stored exclusively in environment variables (`.env`) and are never exposed to the client side.
- **Input Validation**: The backend enforces a 50,000 character limit on source code input to maintain performance and reliability.
- **Rate Limiting**: Includes automated backoff and retry logic for handling API rate limit (429) responses.
- **CORS**: Configured for secure local development.

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- Google Generative AI (Gemini 2.0 Flash)
- CORS for cross-origin requests

**Frontend:**
- React 18 + Vite
- TailwindCSS for styling
- Monaco Editor for code editing
- Lucide React for icons
- Axios for API calls

## 📝 License

Distributed under the MIT License.

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

# GO/ON - Language Practice App

A modern language learning application built with React, TypeScript, and Vite. Practice real-life conversational scenarios with voice interaction and vocabulary management.

## Features

- **Multi-language Support**: Practice in 9+ languages including Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, and Arabic
- **Conversation Scenarios**: Real-life situations like restaurant orders, hotel check-ins, shopping, and more
- **Voice Integration**: Speech-to-text input and text-to-speech output using Web Speech API
- **Personal Vocabulary**: Save and manage your vocabulary with categories and search
- **Interactive Text Highlighting**: Click on text to see translations and save words
- **Custom Scenarios**: Create your own practice scenarios
- **Vocabulary Testing**: Test your knowledge with interactive quizzes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Voice Features**: Web Speech API (SpeechRecognition, SpeechSynthesis)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd language-practice-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## API Integration

The app is designed to be flexible for external API integration. 

### Setting up External APIs

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your API configuration to `.env`:
```env
VITE_API_BASE_URL=https://your-api.com
VITE_API_KEY=your_api_key_here
```

3. Use the `ApiService` class in `src/services/apiService.ts`:

```typescript
import { ApiService } from './services/apiService';

const myApiService = new ApiService({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY
});

// Make API calls
const response = await myApiService.get('/endpoint');
const postResponse = await myApiService.post('/endpoint', { data: 'value' });
```

### Conversation Integration

The conversation components (`ConversationMode` and `FreeConversationMode`) are ready for API integration:

1. Replace the echo responses in `handleSendMessage` functions
2. Integrate with your preferred AI/language service
3. Update the message handling logic as needed

## Project Structure

```
src/
├── components/          # React components
├── data/               # Static data (languages, scenarios)
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Compatibility

- **Voice Features**: Requires modern browsers with Web Speech API support
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

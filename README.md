# Sports Betting Match Details with AI Summary

A React-based sports betting match details page with AI-powered statistics analysis using OpenAI Vision API and Firebase integration.

## Features

- **Match Details Display**: Dark-themed mobile-first design showing match information, team form, and head-to-head results
- **AI Summary**: OpenAI Vision API integration to analyze uploaded match statistics images
- **Admin Upload Interface**: Drag-and-drop file upload with image preview
- **Firebase Integration**: Firestore database for storing AI-generated summaries
- **Responsive Design**: Mobile-optimized with desktop support

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Firebase (Firestore) for data storage
- OpenAI API for image analysis
- Lucide React for icons

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Update the Firebase configuration in `src/lib/firebase.ts`
4. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /matchSummaries/{document} {
      allow read, write: if true; // Adjust security rules as needed
    }
  }
}
```

### 3. OpenAI API Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add the API key to your `.env` file
3. Ensure you have access to GPT-4 Vision API

### 4. Installation and Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

### Viewing Match Details
- The main page displays match information in a mobile-optimized design
- Click "AI SUMMARY" to view AI-generated match analysis
- Form indicators show recent team performance (W/L/D)

### Admin Upload (Image Analysis)
1. Click the "ADMIN" button to open the upload interface
2. Drag and drop or browse to select a match statistics image
3. Click "Analyze with AI" to process the image
4. The AI will generate a summary focusing on key match insights
5. Summary is automatically saved to Firebase and displayed in the AI Summary modal

### Supported Image Formats
- PNG, JPG, JPEG
- Maximum file size: 10MB
- Images should contain match statistics, team form, or relevant match data

## Security Considerations

⚠️ **Important**: This implementation uses client-side OpenAI API calls for demonstration purposes. In production:

1. Move OpenAI API calls to Firebase Cloud Functions
2. Store API keys securely in Firebase environment variables
3. Implement proper authentication and authorization
4. Add rate limiting and input validation

## Project Structure

```
src/
├── components/
│   ├── MatchDetailsPage.tsx    # Main match details display
│   ├── AISummaryModal.tsx      # AI summary popup modal
│   └── AdminUploadModal.tsx    # Image upload interface
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   ├── firestore.ts           # Firestore database operations
│   └── openai.ts              # OpenAI API integration
└── App.tsx                    # Main app component with mobile frame
```

## API Integration

### OpenAI Vision API
- Analyzes uploaded match statistics images
- Generates concise 2-3 sentence summaries
- Focuses on match dynamics and likely outcomes

### Firebase Firestore
- Stores AI-generated summaries with timestamps
- Document structure: `matchSummaries/{matchId}`
- Supports CRUD operations for match data

## Development Notes

- Built as an MVP for hackathon demonstration
- Focus on core functionality over polish
- Mobile-first responsive design
- Error handling and loading states implemented
- Modular component architecture for easy extension

## License

MIT License - feel free to use for educational and demonstration purposes.
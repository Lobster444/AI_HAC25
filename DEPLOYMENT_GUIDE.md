# Firebase Deployment Guide

This guide will help you deploy the Firebase Cloud Functions and set up Firestore for your sports betting app.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created (you already have: `ai-h25-ss`)
3. OpenAI API key

## Setup Steps

### 1. Initialize Firebase in your project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Functions: Configure and deploy Cloud Functions
# - Firestore: Deploy rules and create indexes
```

### 2. Set up environment variables for Cloud Functions

```bash
# Set your OpenAI API key
firebase functions:config:set openai.key="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"

# Verify the configuration
firebase functions:config:get
```

### 3. Install dependencies and deploy

```bash
# Install function dependencies
cd functions
npm install

# Build the functions
npm run build

# Deploy everything
cd ..
firebase deploy
```

### 4. Update Firestore Security Rules

The `firestore.rules` file contains security rules that:
- Allow read access to match summaries for all users
- Require authentication for write operations
- Validate document structure

### 5. Test the deployment

After deployment, you can test the functions:

```bash
# Test locally with emulators
firebase emulators:start

# View function logs
firebase functions:log
```

## Environment Variables Needed

### For Cloud Functions:
- `openai.key` - Your OpenAI API key (set via Firebase CLI)

### For Frontend (no longer needed):
- Remove `VITE_OPENAI_API_KEY` from your `.env` file
- Keep Firebase configuration variables

## Security Benefits

✅ **OpenAI API key is now secure** - Stored in Firebase environment variables, not exposed to client
✅ **Server-side processing** - Image analysis happens on Firebase servers
✅ **Firestore security rules** - Proper access control for database operations
✅ **Input validation** - Cloud Functions validate all inputs
✅ **Error handling** - Proper error responses and logging

## Firestore Document Structure

```typescript
// Collection: matchSummaries
// Document ID: matchId (e.g., "partizan-vs-aek-larnaca-20250717")
{
  id: string;
  matchId: string;
  summary: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Cloud Functions Available

1. **analyzeMatchImage** - Analyzes uploaded images and stores summaries
2. **getMatchSummary** - Retrieves match summary by ID
3. **updateMatchSummary** - Updates existing match summary
4. **deleteMatchSummary** - Deletes match summary

## Troubleshooting

### Common Issues:

1. **Function deployment fails**
   - Check Node.js version (should be 18)
   - Ensure all dependencies are installed
   - Verify Firebase project is selected: `firebase use ai-h25-ss`

2. **OpenAI API calls fail**
   - Verify API key is set: `firebase functions:config:get`
   - Check OpenAI API quota and billing

3. **Firestore permission denied**
   - Check security rules in `firestore.rules`
   - Ensure proper authentication if required

4. **CORS issues**
   - Cloud Functions automatically handle CORS for callable functions
   - No additional CORS configuration needed

## Monitoring

- View function logs: `firebase functions:log`
- Monitor in Firebase Console: https://console.firebase.google.com/project/ai-h25-ss
- Check Firestore usage and queries in the console

## Cost Considerations

- Cloud Functions: Pay per invocation and compute time
- Firestore: Pay per read/write operation and storage
- OpenAI API: Pay per token used in image analysis

Monitor usage in Firebase Console to track costs.
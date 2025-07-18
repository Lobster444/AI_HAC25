import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// Interface for match summary document
interface MatchSummary {
  id: string;
  matchId: string;
  summary: string;
  imageUrl?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// Cloud Function to analyze match image and store summary
export const analyzeMatchImage = functions.https.onCall(async (data, context) => {
  try {
    // Validate input
    if (!data.imageBase64 || !data.matchId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: imageBase64 and matchId'
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this sports match statistics image and provide a concise 2-3 sentence summary focusing on key insights that would help someone understand the match dynamics and likely outcome. Focus on team form, head-to-head records, and any statistical advantages."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${data.imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const summary = response.choices[0]?.message?.content || "Unable to analyze the image.";

    // Store in Firestore
    const now = admin.firestore.Timestamp.now();
    const matchSummaryData: MatchSummary = {
      id: data.matchId,
      matchId: data.matchId,
      summary,
      imageUrl: data.imageUrl,
      createdAt: now,
      updatedAt: now
    };

    await db.collection('matchSummaries').doc(data.matchId).set(matchSummaryData);

    return {
      success: true,
      summary,
      matchId: data.matchId
    };

  } catch (error) {
    console.error('Error analyzing match image:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to analyze image',
      error
    );
  }
});

// Cloud Function to get match summary
export const getMatchSummary = functions.https.onCall(async (data, context) => {
  try {
    if (!data.matchId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required field: matchId'
      );
    }

    const doc = await db.collection('matchSummaries').doc(data.matchId).get();
    
    if (!doc.exists) {
      return { success: true, summary: null };
    }

    return {
      success: true,
      summary: doc.data()
    };

  } catch (error) {
    console.error('Error getting match summary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get match summary',
      { message: error instanceof Error ? error.message : String(error) }
    );
  }
});

// Cloud Function to update match summary
export const updateMatchSummary = functions.https.onCall(async (data, context) => {
  try {
    if (!data.matchId || !data.summary) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: matchId and summary'
      );
    }

    await db.collection('matchSummaries').doc(data.matchId).update({
      summary: data.summary,
      imageUrl: data.imageUrl,
      updatedAt: admin.firestore.Timestamp.now()
    });

    return { success: true };

  } catch (error) {
    console.error('Error updating match summary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update match summary',
      error
    );
  }
});

// Cloud Function to delete match summary
export const deleteMatchSummary = functions.https.onCall(async (data, context) => {
  try {
    if (!data.matchId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required field: matchId'
      );
    }

    await db.collection('matchSummaries').doc(data.matchId).delete();

    return { success: true };

  } catch (error) {
    console.error('Error deleting match summary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete match summary',
      error
    );
  }
});
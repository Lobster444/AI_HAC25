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
  bettingSuggestion: string;
  overUnderOdds: { over: string; under: string; } | null;
  imageUrl?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// Function to generate random odds between 1.50 and 3.00
const generateRandomOdds = (): { over: string; under: string; } => {
  const overOdds = (Math.random() * (3.00 - 1.50) + 1.50).toFixed(2);
  const underOdds = (Math.random() * (3.00 - 1.50) + 1.50).toFixed(2);
  return { over: overOdds, under: underOdds };
};

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
              text: "Analyze this sports match statistics image and provide two separate analyses:\n\n1. MATCH SUMMARY: A concise 2-3 sentence summary focusing on key insights that would help someone understand the match dynamics and likely outcome. Focus on team form, head-to-head records, and any statistical advantages.\n\n2. GOALS ANALYSIS: Analyze the goal-scoring patterns from previous games shown in the image. Based on this data, provide a specific recommendation for Total Goals Over/Under betting (e.g., 'Over 2.5 goals' or 'Under 1.5 goals') in ONE sentence only.\n\nFormat your response as:\nMATCH SUMMARY: [your summary here]\nGOALS ANALYSIS: [your goals analysis and betting recommendation in one sentence]"
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

    const fullResponse = response.choices[0]?.message?.content || "Unable to analyze the image.";
    
    // Parse the response to separate summary and betting suggestion
    let summary = fullResponse;
    let bettingSuggestion = "Unable to provide betting analysis.";
    
    if (fullResponse.includes("MATCH SUMMARY:") && fullResponse.includes("GOALS ANALYSIS:")) {
      const parts = fullResponse.split("GOALS ANALYSIS:");
      summary = parts[0].replace("MATCH SUMMARY:", "").trim();
      bettingSuggestion = parts[1].trim();
    }
    
    // Generate random odds
    const overUnderOdds = generateRandomOdds();

    // Store in Firestore
    const now = admin.firestore.Timestamp.now();
    const matchSummaryData: MatchSummary = {
      id: data.matchId,
      matchId: data.matchId,
      summary,
      bettingSuggestion,
      overUnderOdds,
      imageUrl: data.imageUrl,
      createdAt: now,
      updatedAt: now
    };

    await db.collection('matchSummaries').doc(data.matchId).set(matchSummaryData);

    return {
      success: true,
      summary,
      bettingSuggestion,
      overUnderOdds,
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
      error
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

    const updateData: any = {
      summary: data.summary,
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    if (data.bettingSuggestion !== undefined) {
      updateData.bettingSuggestion = data.bettingSuggestion;
    }
    
    if (data.overUnderOdds !== undefined) {
      updateData.overUnderOdds = data.overUnderOdds;
    }
    
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    await db.collection('matchSummaries').doc(data.matchId).update(updateData);

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
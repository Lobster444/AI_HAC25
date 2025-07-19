import { getOpenAIKey } from './firestore';

export interface OpenAIAnalysisResult {
  summary: string;
  bettingSuggestion: string;
  overUnderOdds: { over: string; under: string; };
  success: boolean;
  error?: string;
}

// Function to generate random odds between 1.50 and 3.00
const generateRandomOdds = (): { over: string; under: string; } => {
  const overOdds = (Math.random() * (3.00 - 1.50) + 1.50).toFixed(2);
  const underOdds = (Math.random() * (3.00 - 1.50) + 1.50).toFixed(2);
  return { over: overOdds, under: underOdds };
};

export const analyzeMatchImage = async (imageBase64: string): Promise<OpenAIAnalysisResult> => {
  try {
    // Get API key from Firestore
    const apiKey = await getOpenAIKey();
    
    if (!apiKey) {
      return {
        summary: '',
        bettingSuggestion: '',
        overUnderOdds: { over: '0.00', under: '0.00' },
        success: false,
        error: 'OpenAI API key not configured. Please add it in the admin settings.'
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this sports match statistics image and provide two separate analyses:\n\n1. MATCH SUMMARY: A concise 2-3 sentence summary focusing on key insights that would help someone understand the match dynamics and likely outcome. Focus on team form, head-to-head records, and any statistical advantages.\n\n2. GOALS ANALYSIS: Analyze the goal-scoring patterns from previous games shown in the image. Based on this data, provide a specific recommendation for Total Goals Over/Under betting (e.g., \'Over 2.5 goals\' or \'Under 1.5 goals\') in ONE sentence only.\n\nFormat your response as:\nMATCH SUMMARY: [your summary here]\nGOALS ANALYSIS: [your goals analysis and betting recommendation in one sentence]'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 400
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0]?.message?.content || 'Unable to analyze the image.';
    
    // Parse the response to separate summary and betting suggestion
    let summary = fullResponse;
    let bettingSuggestion = 'Unable to provide betting analysis.';
    
    if (fullResponse.includes('MATCH SUMMARY:') && fullResponse.includes('GOALS ANALYSIS:')) {
      const parts = fullResponse.split('GOALS ANALYSIS:');
      summary = parts[0].replace('MATCH SUMMARY:', '').trim();
      bettingSuggestion = parts[1].trim();
    }
    
    // Generate random odds
    const overUnderOdds = generateRandomOdds();

    return {
      summary,
      bettingSuggestion,
      overUnderOdds,
      success: true
    };

  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    return {
      summary: '',
      bettingSuggestion: '',
      overUnderOdds: { over: '0.00', under: '0.00' },
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image'
    };
  }
};
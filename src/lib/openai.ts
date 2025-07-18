import { getOpenAIKey } from './firestore';

export interface OpenAIAnalysisResult {
  summary: string;
  success: boolean;
  error?: string;
}

export const analyzeMatchImage = async (imageBase64: string): Promise<OpenAIAnalysisResult> => {
  try {
    // Get API key from Firestore
    const apiKey = await getOpenAIKey();
    
    if (!apiKey) {
      return {
        summary: '',
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
                text: 'Analyze this sports match statistics image and provide a concise 2-3 sentence summary focusing on key insights that would help someone understand the match dynamics and likely outcome. Focus on team form, head-to-head records, and any statistical advantages.'
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
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || 'Unable to analyze the image.';

    return {
      summary,
      success: true
    };

  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    return {
      summary: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image'
    };
  }
};
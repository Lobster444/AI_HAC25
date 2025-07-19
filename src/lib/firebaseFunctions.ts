import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

const functions = getFunctions(app);

// Interface for match summary
export interface MatchSummary {
  id: string;
  matchId: string;
  summary: string;
  bettingSuggestion: string;
  overUnderOdds: { over: string; under: string; } | null;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Call Cloud Function to analyze match image
export const analyzeMatchImageFunction = httpsCallable(functions, 'analyzeMatchImage');

// Call Cloud Function to get match summary
export const getMatchSummaryFunction = httpsCallable(functions, 'getMatchSummary');

// Call Cloud Function to update match summary
export const updateMatchSummaryFunction = httpsCallable(functions, 'updateMatchSummary');

// Call Cloud Function to delete match summary
export const deleteMatchSummaryFunction = httpsCallable(functions, 'deleteMatchSummary');

// Wrapper functions for easier use
export const analyzeMatchImage = async (imageBase64: string, matchId: string, imageUrl?: string): Promise<{ summary: string; bettingSuggestion: string; overUnderOdds: { over: string; under: string; } }> => {
  try {
    const result = await analyzeMatchImageFunction({
      imageBase64,
      matchId,
      imageUrl
    });
    
    const data = result.data as { 
      success: boolean; 
      summary: string; 
      bettingSuggestion: string;
      overUnderOdds: { over: string; under: string; };
      matchId: string;
    };
    
    if (data.success) {
      return { summary: data.summary, bettingSuggestion: data.bettingSuggestion, overUnderOdds: data.overUnderOdds };
    } else {
      throw new Error('Failed to analyze image');
    }
  } catch (error) {
    console.error('Error calling analyzeMatchImage function:', error);
    throw new Error('Failed to analyze image with AI');
  }
};

export const getMatchSummary = async (matchId: string): Promise<MatchSummary | null> => {
  try {
    const result = await getMatchSummaryFunction({ matchId });
    const data = result.data as { success: boolean; summary: any };
    
    if (data.success && data.summary) {
      return {
        ...data.summary,
        createdAt: data.summary.createdAt.toDate(),
        updatedAt: data.summary.updatedAt.toDate()
      } as MatchSummary;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting match summary:', error);
    throw new Error('Failed to get match summary');
  }
};

export const updateMatchSummary = async (matchId: string, summary: string, bettingSuggestion?: string, overUnderOdds?: { over: string; under: string; }, imageUrl?: string): Promise<void> => {
  try {
    const result = await updateMatchSummaryFunction({
      matchId,
      summary,
      bettingSuggestion,
      overUnderOdds,
      imageUrl
    });
    
    const data = result.data as { success: boolean };
    
    if (!data.success) {
      throw new Error('Failed to update match summary');
    }
  } catch (error) {
    console.error('Error updating match summary:', error);
    throw new Error('Failed to update match summary');
  }
};

export const deleteMatchSummary = async (matchId: string): Promise<void> => {
  try {
    const result = await deleteMatchSummaryFunction({ matchId });
    const data = result.data as { success: boolean };
    
    if (!data.success) {
      throw new Error('Failed to delete match summary');
    }
  } catch (error) {
    console.error('Error deleting match summary:', error);
    throw new Error('Failed to delete match summary');
  }
};
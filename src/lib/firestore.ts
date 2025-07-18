import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface MatchSummary {
  id: string;
  matchId: string;
  summary: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'matchSummaries';

export const saveMatchSummary = async (matchId: string, summary: string, imageUrl?: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    const now = new Date();
    
    const docData: any = {
      id: matchId,
      matchId,
      summary,
      createdAt: now,
      updatedAt: now
    };
    
    // Only add imageUrl if it's not undefined
    if (imageUrl !== undefined) {
      docData.imageUrl = imageUrl;
    }
    
    await setDoc(docRef, docData);
  } catch (error) {
    console.error('Error saving match summary:', error);
    throw new Error('Failed to save match summary');
  }
};

export const getMatchSummary = async (matchId: string): Promise<MatchSummary | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as MatchSummary;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting match summary:', error);
    throw new Error('Failed to get match summary');
  }
};

export const updateMatchSummary = async (matchId: string, summary: string, imageUrl?: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    
    const updateData: any = {
      summary,
      updatedAt: new Date()
    };
    
    // Only add imageUrl if it's not undefined
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating match summary:', error);
    throw new Error('Failed to update match summary');
  }
};

export const deleteMatchSummary = async (matchId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, matchId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting match summary:', error);
    throw new Error('Failed to delete match summary');
  }
};

// API Key management
export interface ApiKeyConfig {
  id: string;
  openaiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const API_CONFIG_COLLECTION = 'apiConfig';
const API_CONFIG_DOC_ID = 'openai';

export const saveOpenAIKey = async (apiKey: string): Promise<void> => {
  try {
    const docRef = doc(db, API_CONFIG_COLLECTION, API_CONFIG_DOC_ID);
    const now = new Date();
    
    await setDoc(docRef, {
      id: API_CONFIG_DOC_ID,
      openaiKey: apiKey,
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error saving OpenAI API key:', error);
    throw new Error('Failed to save OpenAI API key');
  }
};

export const getOpenAIKey = async (): Promise<string | null> => {
  try {
    const docRef = doc(db, API_CONFIG_COLLECTION, API_CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.openaiKey || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting OpenAI API key:', error);
    throw new Error('Failed to get OpenAI API key');
  }
};

export const deleteOpenAIKey = async (): Promise<void> => {
  try {
    const docRef = doc(db, API_CONFIG_COLLECTION, API_CONFIG_DOC_ID);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting OpenAI API key:', error);
    throw new Error('Failed to delete OpenAI API key');
  }
};
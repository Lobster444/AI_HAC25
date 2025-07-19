import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Shield, Database, Eye, Trash2, Edit3, Key, Save, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import AdminUploadModal from './AdminUploadModal';
import { getMatchSummary, deleteMatchSummary, saveOpenAIKey, getOpenAIKey, deleteOpenAIKey, MatchSummary } from '../lib/firestore';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<MatchSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    lastUpdated: null as Date | null,
    totalSummaries: 0
  });
  const [apiKey, setApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState('');

  // Simple password authentication (in production, use proper auth)
  const ADMIN_PASSWORD = 'admin123'; // In production, use environment variables

  useEffect(() => {
    loadSummaryStats();
    loadApiKeyStatus();
  }, []);

  const loadApiKeyStatus = async () => {
    try {
      const key = await getOpenAIKey();
      setCurrentApiKey(key);
      setIsApiKeyConfigured(!!key);
    } catch (error) {
      console.error('Error loading API key status:', error);
    }
  };

  const loadSummaryStats = async () => {
    try {
      const matchId = 'team-a-vs-team-b-20250717';
      const summary = await getMatchSummary(matchId);
      if (summary) {
        setSummaryStats({
          lastUpdated: summary.updatedAt,
          totalSummaries: 1
        });
        setCurrentSummary(summary);
      }
    } catch (error) {
      console.error('Error loading summary stats:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleSummaryUpdated = (newSummary: MatchSummary) => {
    setCurrentSummary(newSummary);
    loadSummaryStats();
  };

  const handleDeleteSummary = async () => {
    if (window.confirm('Are you sure you want to delete the current AI summary?')) {
      try {
        const matchId = 'team-a-vs-team-b-20250717';
        await deleteMatchSummary(matchId);
        setCurrentSummary(null);
        setSummaryStats({
          lastUpdated: null,
          totalSummaries: 0
        });
        alert('Summary deleted successfully');
      } catch (error) {
        alert('Error deleting summary');
      }
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setApiKeyError('Please enter a valid API key');
      return;
    }

    setIsSavingApiKey(true);
    setApiKeyError('');
    setApiKeySuccess('');

    try {
      await saveOpenAIKey(apiKey.trim());
      setApiKeySuccess('OpenAI API key saved successfully!');
      setCurrentApiKey(apiKey.trim());
      setIsApiKeyConfigured(true);
      setApiKey('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setApiKeySuccess(''), 3000);
    } catch (error) {
      setApiKeyError('Failed to save API key. Please try again.');
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (window.confirm('Are you sure you want to delete the OpenAI API key? This will disable AI analysis functionality.')) {
      try {
        await deleteOpenAIKey();
        setCurrentApiKey(null);
        setIsApiKeyConfigured(false);
        setApiKeySuccess('API key deleted successfully');
        setTimeout(() => setApiKeySuccess(''), 3000);
      } catch (error) {
        setApiKeyError('Failed to delete API key');
      }
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="w-full max-w-sm p-6">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            
            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Match Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="h-screen bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-orange-500 px-4 py-4 pt-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-base font-semibold">Back to Match</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span className="text-base font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-4 space-y-6">
        {/* Security Warning */}
        <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-yellow-400 font-semibold">Security Notice</h3>
          </div>
          <p className="text-yellow-200 text-sm">
            For production environments, it's recommended to use Firebase CLI to set API keys as environment variables. 
            This admin interface stores keys in Firestore for development convenience.
          </p>
        </div>

        {/* OpenAI API Key Configuration */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Key className="w-5 h-5 text-orange-500" />
            <span>OpenAI API Configuration</span>
          </h2>
          
          <div className="space-y-4">
            {/* Current Status */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Key Status:</span>
                <span className={`font-semibold ${isApiKeyConfigured ? 'text-green-400' : 'text-red-400'}`}>
                  {isApiKeyConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              {currentApiKey && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-300">Current Key:</span>
                  <span className="text-gray-400 font-mono text-sm">
                    {currentApiKey.substring(0, 8)}...{currentApiKey.substring(currentApiKey.length - 4)}
                  </span>
                </div>
              )}
            </div>

            {/* Add/Update API Key Form */}
            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              {apiKeyError && (
                <div className="bg-red-600/20 border border-red-500 rounded-lg p-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-red-300 text-sm">{apiKeyError}</p>
                </div>
              )}
              
              {apiKeySuccess && (
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-2 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-green-300 text-sm">{apiKeySuccess}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSavingApiKey || !apiKey.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
                >
                  {isSavingApiKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isApiKeyConfigured ? 'Update' : 'Save'} API Key</span>
                    </>
                  )}
                </button>
                
                {isApiKeyConfigured && (
                  <button
                    type="button"
                    onClick={handleDeleteApiKey}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Database className="w-5 h-5 text-orange-500" />
            <span>Summary Statistics</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Total Summaries</p>
              <p className="text-2xl font-bold text-white">{summaryStats.totalSummaries}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-sm font-semibold text-white">
                {summaryStats.lastUpdated 
                  ? summaryStats.lastUpdated.toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Current Summary Preview */}
        {currentSummary && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <span>Current AI Summary</span>
            </h3>
            
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <div className="space-y-2">
                <div>
                  <p className="text-orange-300 text-xs font-medium mb-1">Match Summary:</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{currentSummary.summary}</p>
                </div>
                {currentSummary.bettingSuggestion && (
                  <div>
                    <p className="text-green-300 text-xs font-medium mb-1">Betting Suggestion:</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{currentSummary.bettingSuggestion}</p>
                  </div>
                )}
                {currentSummary.overUnderOdds && (
                  <div>
                    <p className="text-blue-300 text-xs font-medium mb-1">Generated Odds:</p>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-400">Over: {currentSummary.overUnderOdds.over}</span>
                      <span className="text-blue-400">Under: {currentSummary.overUnderOdds.under}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleDeleteSummary}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Summary</span>
            </button>
          </div>
        )}

        {/* Upload Actions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-orange-500" />
            <span>Upload Management</span>
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!isApiKeyConfigured}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload New Statistics Image</span>
            </button>
            
            {isApiKeyConfigured ? (
              <p className="text-gray-400 text-sm text-center">
                Upload match statistics screenshots to generate AI summaries
              </p>
            ) : (
              <p className="text-red-400 text-sm text-center">
                Please configure your OpenAI API key first to enable image analysis
              </p>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-orange-500" />
            <span>System Information</span>
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">OpenAI API Status:</span>
              <span className={isApiKeyConfigured ? 'text-green-400' : 'text-red-400'}>
                {isApiKeyConfigured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Firebase Status:</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Match ID:</span>
              <span className="text-white">team-a-vs-team-b-20250717</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="text-center pt-4">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <AdminUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSummaryUpdated={handleSummaryUpdated}
      />
    </div>
  );
};

export default AdminPage;
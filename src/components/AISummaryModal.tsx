import React, { useState, useEffect } from 'react';
import { X, Brain, Loader2, TrendingUp, Target } from 'lucide-react';
import { MatchSummary } from '../lib/firestore';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSummary?: MatchSummary | null;
}

const AISummaryModal: React.FC<AISummaryModalProps> = ({ isOpen, onClose, customSummary }) => {
  const [loading, setLoading] = useState(true);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
  const [error, setError] = useState('');

  // Simulate AI analysis with loading state
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setMatchSummary(null);
      setError('');
      
      // Simulate API call with delay
      if (customSummary) {
        // Use the uploaded and analyzed summary
        setMatchSummary(customSummary);
        setLoading(false);
      } else {
        // Use mock data if no custom summary available
        const timer = setTimeout(() => {
          const mockSummary: MatchSummary = {
            id: 'mock-summary',
            matchId: 'team-a-vs-team-b-20250717',
            summary: `Based on the match statistics and recent form analysis:

**Match Overview:**
Team A faces Team B in the UEFA Europa League with Team B currently leading 1-0. The match is scheduled for 20:00 on 17/07/2025.

**Form Analysis:**
- Team A shows concerning form with 4 consecutive losses (L-L-L-L) before their recent win
- Team B demonstrates strong form with 3 wins and 2 draws in their last 5 matches (W-D-D-W-W)

**Head-to-Head Record:**
Recent encounters favor Team B:
- July 2025: Team B won 1-0
- August 2022: Drew 2-2
- August 2022: Team B won 2-1

**Key Insights:**
1. Team B's superior recent form suggests they're the stronger team currently
2. The psychological advantage lies with Team B having already scored first
3. Team A's poor form streak indicates potential defensive vulnerabilities
4. Historical head-to-head results support Team B's current advantage

**Betting Recommendation:**
Current odds favor Team B at 2.20, which appears reasonable given their form and current lead. Team A at 3.10 offers higher returns but carries significantly more risk given their recent performances.`,
            bettingSuggestion: `Based on goal-scoring patterns from recent matches, both teams have shown moderate attacking output. Team A averages 1.2 goals per game in their last 5 matches, while Team B averages 1.8 goals. Defensively, both teams have been relatively solid. Given the current match situation and historical data, I recommend **Under 2.5 goals** for this match. The teams' recent form suggests a tactical, low-scoring affair.`,
            bettingSuggestion: `Based on recent goal-scoring patterns, I recommend **Under 2.5 goals** as both teams average low scoring games.`,
            bettingSuggestion: `Under 2.5 goals recommended`,
            overUnderOdds: { over: '2.15', under: '1.85' },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setMatchSummary(mockSummary);
          setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, customSummary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-gray-800 rounded-xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-orange-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">SmartStats AI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-white max-h-[calc(90vh-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <p className="text-lg font-semibold mb-3">Analyzing Match Statistics...</p>
              <p className="text-gray-400 text-center text-sm leading-relaxed max-w-xs">
                Our AI is processing team form, head-to-head records, and current match data to generate insights.
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg font-semibold mb-3">Analysis Error</p>
              <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  // Retry logic would go here
                }}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* AI Generated Summary */}
              <div className="bg-gray-700 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-400 font-semibold text-base">AI Pre-match Summary</span>
                </div>
                <div className="text-gray-200 leading-relaxed text-sm">
                  {matchSummary?.summary.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-orange-400 font-semibold text-base mt-4 mb-2 first:mt-0">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={index} className="text-gray-200 ml-4 text-sm mb-1">
                          {line.substring(2)}
                        </li>
                      );
                    }
                    if (line.match(/^\d+\./)) {
                      return (
                        <li key={index} className="text-gray-200 ml-4 text-sm mb-1">
                          {line}
                        </li>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <p key={index} className="text-gray-200 mb-3 text-sm leading-relaxed">
                          {line}
                        </p>
                      );
                    }
                    return <br key={index} />;
                  })}
                </div>
              </div>

              {/* Betting Suggestion Section */}
              {matchSummary?.bettingSuggestion && (
                <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold text-base">O/U Total Goals Betting Suggestion</span>
                  </div>
                  <p className="text-green-100 text-sm leading-relaxed mb-4">
                    {matchSummary.bettingSuggestion}
                  </p>
                  
                  {/* Odds Display */}
                  {matchSummary.overUnderOdds && (
                    <div className="bg-green-700/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-300" />
                        <span className="text-green-300 font-semibold text-sm">Recommended Bet</span>
                      </div>
                      <div className="flex justify-center">
                        {(() => {
                          // Determine which bet to recommend based on the betting suggestion
                          const isOverRecommended = matchSummary.bettingSuggestion.toLowerCase().includes('over');
                          const isUnderRecommended = matchSummary.bettingSuggestion.toLowerCase().includes('under');
                          
                          // Parse the numeric total from the betting suggestion
                          const suggestion = matchSummary.bettingSuggestion.toLowerCase();
                          const match = suggestion.match(/(over|under)\s*([0-9]+(?:\.[0-9]+)?)/);
                          const betType = match?.[1] ?? (isOverRecommended ? 'over' : 'under');
                          const betValue = match?.[2] ?? '2.5';
                          const betLabel = `${betType.charAt(0).toUpperCase() + betType.slice(1)} ${betValue} Goals`;
                          
                          if (isOverRecommended) {
                            return (
                              <div className="bg-blue-600 rounded-lg px-3 py-2 w-full text-center shadow-lg">
                                <p className="text-white text-xs font-semibold mb-1">{betLabel}</p>
                                <p className="text-white text-xl font-bold">{matchSummary.overUnderOdds.over}</p>
                              </div>
                            );
                          } else if (isUnderRecommended) {
                            return (
                              <div className="bg-blue-600 rounded-lg px-3 py-2 w-full text-center shadow-lg">
                                <p className="text-white text-xs font-semibold mb-1">{betLabel}</p>
                                <p className="text-white text-xl font-bold">{matchSummary.overUnderOdds.under}</p>
                              </div>
                            );
                          } else {
                            // Default to Under if no clear recommendation
                            return (
                              <div className="bg-blue-600 rounded-lg px-3 py-2 w-full text-center shadow-lg">
                                <p className="text-white text-xs font-semibold mb-1">{betLabel}</p>
                                <p className="text-white text-xl font-bold">{matchSummary.overUnderOdds.under}</p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4">
                <p className="text-blue-300 text-xs leading-relaxed">
                  <strong>Disclaimer:</strong> This analysis and betting suggestions are generated by AI and should be used as supplementary information only. 
                  Odds are randomly generated for demonstration purposes. Always conduct your own research and gamble responsibly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-5 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;
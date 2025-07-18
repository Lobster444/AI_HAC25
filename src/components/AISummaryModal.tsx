import React, { useState, useEffect } from 'react';
import { X, Brain, Loader2 } from 'lucide-react';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSummary?: string;
}

const AISummaryModal: React.FC<AISummaryModalProps> = ({ isOpen, onClose, customSummary }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  // Simulate AI analysis with loading state
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSummary('');
      setError('');
      
      // Simulate API call with delay
      if (customSummary) {
        // Use the uploaded and analyzed summary
        setSummary(customSummary);
        setLoading(false);
      } else {
        // Use mock data if no custom summary available
        const timer = setTimeout(() => {
          setSummary(`Based on the match statistics and recent form analysis:

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
Current odds favor Team B at 2.20, which appears reasonable given their form and current lead. Team A at 3.10 offers higher returns but carries significantly more risk given their recent performances.`);
          setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, customSummary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-gray-800 rounded-lg w-full max-w-sm max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">SmartStats AI Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-white max-h-[calc(85vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
              <p className="text-base font-semibold mb-2">Analyzing Match Statistics...</p>
              <p className="text-gray-400 text-center text-sm">
                Our AI is processing team form, head-to-head records, and current match data to generate insights.
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-base font-semibold mb-2">Analysis Error</p>
              <p className="text-gray-400 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  // Retry logic would go here
                }}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded transition-colors text-sm"
              >
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-500 font-semibold text-sm">AI Generated Summary</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  {summary.split('\n').map((line, index) => {
                    // Skip the "Based on analysis" line
                    if (line.includes('Based on analysis of') && line.includes('match statistics images:')) {
                      return null;
                    }
                    
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-orange-400 font-semibold text-base mt-3 mb-2">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={index} className="text-gray-300 ml-3 text-sm">
                          {line.substring(2)}
                        </li>
                      );
                    }
                    if (line.match(/^\d+\./)) {
                      return (
                        <li key={index} className="text-gray-300 ml-3 text-sm">
                          {line}
                        </li>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <p key={index} className="text-gray-300 mb-2 text-sm">
                          {line}
                        </p>
                      );
                    }
                    return <br key={index} />;
                  })}
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  <strong>Disclaimer:</strong> This analysis is generated by AI and should be used as supplementary information only. 
                  Always conduct your own research and gamble responsibly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;
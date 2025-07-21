import React, { useState } from 'react';
import { ChevronLeft, Play, BarChart3, Menu, Clock, CheckSquare, Gamepad2, Brain } from 'lucide-react';
import AISummaryModal from './AISummaryModal';
import { getMatchSummary, MatchSummary } from '../lib/firestore';

const MatchDetailsPage: React.FC = () => {
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<MatchSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const formData = {
    teamA: ['L', 'L', 'L', 'L', 'W'],
    teamB: ['W', 'D', 'D', 'W', 'W']
  };

  const headToHeadResults = [
    { date: "Jul '25", score: "0 - 1", teamAColor: "bg-yellow-500", teamBColor: "bg-teal-500" },
    { date: "Aug '22", score: "2 - 2", teamAColor: "bg-yellow-500", teamBColor: "bg-teal-500" },
    { date: "Aug '22", score: "1 - 2", teamAColor: "bg-yellow-500", teamBColor: "bg-teal-500" }
  ];

  const getFormBadgeClass = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-600';
      case 'L': return 'bg-red-600';
      case 'D': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const handleAISummaryClick = async () => {
    setIsLoadingSummary(true);
    try {
      const matchId = 'team-a-vs-team-b-20250717';
      const summary = await getMatchSummary(matchId);
      
      if (summary) {
        setAiSummary(summary);
      } else {
        setAiSummary(null); // Will show default mock summary
      }
    } catch (error) {
      console.error('Error loading AI summary:', error);
      setAiSummary(null); // Will show default mock summary
    } finally {
      setIsLoadingSummary(false);
      setIsAISummaryOpen(true);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-red-600 px-4 py-3 pt-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChevronLeft className="w-6 h-6" />
          <span className="text-base font-semibold">Back</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">300</span>
          </div>
          <span className="text-base font-semibold">£1.19</span>
        </div>
      </div>

      {/* League Header */}
      <div className="bg-gray-800 px-4 py-2.5 border-b border-gray-700">
        <h1 className="text-lg font-bold">UEFA Europa League</h1>
      </div>

      {/* Change Match & Watch */}
      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400 font-semibold text-sm">CHANGE MATCH</span>
          <ChevronLeft className="w-4 h-4 text-yellow-400 rotate-180" />
        </div>
        <button className="bg-yellow-500 text-black px-3 py-1 rounded font-semibold flex items-center space-x-1 text-sm">
          <Play className="w-4 h-4" />
          <span>WATCH</span>
        </button>
      </div>

      {/* Match Info */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="text-center mb-4">
          <p className="text-gray-300 text-base">20:00 - 17/07/2025</p>
        </div>
        <div className="flex items-center justify-center space-x-6">
          <div className="w-1 h-12 bg-yellow-500 rounded"></div>
          <div className="text-center">
            <p className="text-lg font-bold">Team A (0) v (1) Team B</p>
          </div>
          <div className="w-1 h-12 bg-teal-500 rounded"></div>
        </div>
      </div>

      {/* Latest Form */}
      <div className="px-4 py-4 bg-gray-800 border-b border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-teal-400 font-semibold mb-3 text-sm">LATEST FORM</h2>
          <div className="flex justify-center items-center space-x-12">
            {/* Partizan Form */}
            <div className="flex space-x-1">
              {formData.teamA.map((result, index) => (
                <div
                  key={index}
                  className={`w-7 h-7 ${getFormBadgeClass(result)} rounded flex items-center justify-center text-white font-bold text-xs`}
                >
                  {result}
                </div>
              ))}
            </div>
            
            {/* Team B Form */}
            <div className="flex space-x-1">
              {formData.teamB.map((result, index) => (
                <div
                  key={index}
                  className={`w-7 h-7 ${getFormBadgeClass(result)} rounded flex items-center justify-center text-white font-bold text-xs`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Head to Head */}
        <div className="mb-6">
          <h3 className="text-center text-base font-semibold mb-3">HEAD TO HEAD</h3>
          <div className="space-y-3">
            {headToHeadResults.map((result, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-xs text-gray-400 text-right">{result.date}</div>
                <div className="flex-1 flex items-center">
                  <div className={`h-2 ${result.teamAColor} rounded-l ml-3`} style={{ width: '35%' }}></div>
                  <div className="bg-gray-700 px-3 py-1 text-xs font-semibold min-w-fit">{result.score}</div>
                  <div className={`h-2 ${result.teamBColor} rounded-r`} style={{ width: '35%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Buttons */}
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-400">PLAYER STATS</p>
          </div>
          <div className="text-center">
            <Menu className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-400">STANDINGS</p>
          </div>
          <div className="text-center">
            <button className="text-teal-400 border border-teal-400 px-3 py-1 rounded font-semibold hover:bg-teal-400 hover:text-gray-900 transition-colors text-xs">
              MORE STATS
            </button>
          </div>
        </div>

        {/* AI Summary Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleAISummaryClick}
            disabled={isLoadingSummary}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            {isLoadingSummary ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>LOADING...</span>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[14px] flex items-center">
                  <Brain className="w-4 h-4 inline-block" />&nbsp; AI Match Edge
                </span>
                <span className="text-[10px]">Generates summary &amp; Reorder markets</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Markets Section */}
      <div className="bg-white text-gray-900 px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">MARKETS</h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="font-semibold">B</span>
            <span className="text-sm">BET BUILDER</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          <button className="bg-gray-200 px-3 py-1 rounded-full text-xs whitespace-nowrap">All Markets</button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">Main</button>
          <button className="bg-gray-200 px-3 py-1 rounded-full text-xs whitespace-nowrap">Team Goals</button>
          <button className="bg-gray-200 px-3 py-1 rounded-full text-xs whitespace-nowrap">Half</button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">2Up&Win - Early Payout</span>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold">B</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">Win if your selection takes a 2 goal lead in 90 minutes</p>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs font-semibold">TEAM A</p>
              <p className="text-base font-bold">3.10</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold">DRAW</p>
              <p className="text-base font-bold">3.00</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold">TEAM B</p>
              <p className="text-base font-bold">2.20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 flex justify-around items-center py-3 border-t border-gray-700">
        <div className="text-center">
          <div className="w-5 h-5 mx-auto mb-1 text-gray-400 text-sm font-bold">L</div>
          <p className="text-xs text-gray-400">Home</p>
        </div>
        <div className="text-center">
          <Menu className="w-5 h-5 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400">Menu</p>
        </div>
        <div className="text-center">
          <CheckSquare className="w-5 h-5 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400">My Bets</p>
        </div>
        <div className="text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400">In-Play</p>
        </div>
        <div className="text-center">
          <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400">Gaming</p>
        </div>
      </div>

      {/* AI Summary Modal */}
      <AISummaryModal 
        isOpen={isAISummaryOpen} 
        onClose={() => setIsAISummaryOpen(false)} 
        customSummary={aiSummary}
      />
    </div>
  );
};

export default MatchDetailsPage;
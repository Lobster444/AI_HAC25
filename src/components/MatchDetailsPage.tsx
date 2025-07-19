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
    { date: "Jul '25", score: "0 - 1", teamAColor: "bg-red-600", teamBColor: "bg-teal-500" },
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
      <div className="bg-red-600 px-5 py-4 pt-10 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <ChevronLeft className="w-6 h-6 text-white" />
          <span className="text-lg font-semibold text-white">Back</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-sm font-bold text-white">300</span>
          </div>
          <span className="text-lg font-bold text-white">£1.19</span>
        </div>
      </div>

      {/* League Header */}
      <div className="bg-gray-800 px-5 py-3 border-b border-gray-700/50">
        <h1 className="text-xl font-bold text-white">UEFA Europa League</h1>
      </div>

      {/* Change Match & Watch */}
      <div className="bg-gray-800 px-5 py-3 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400 font-bold text-sm tracking-wide">CHANGE MATCH</span>
          <ChevronLeft className="w-5 h-5 text-yellow-400 rotate-180" />
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2 text-sm transition-colors shadow-md">
          <Play className="w-4 h-4 fill-current" />
          <span className="tracking-wide">WATCH</span>
        </button>
      </div>

      {/* Match Info */}
      <div className="px-5 py-4 bg-gray-800 border-b border-gray-700/50">
        <div className="text-center mb-5">
          <p className="text-gray-300 text-lg font-medium">20:00 - 17/07/2025</p>
        </div>
        <div className="flex items-center justify-center space-x-8">
          <div className="w-1.5 h-14 bg-yellow-500 rounded-full shadow-sm"></div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">Team A (0) v (1) Team B</p>
          </div>
          <div className="w-1.5 h-14 bg-teal-500 rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Latest Form */}
      <div className="px-5 py-5 bg-gray-800 border-b border-gray-700/50">
        <div className="text-center mb-7">
          <h2 className="text-teal-400 font-bold mb-4 text-sm tracking-wider">LATEST FORM</h2>
          <div className="flex justify-center items-center space-x-16">
            {/* Partizan Form */}
            <div className="flex space-x-1.5">
              {formData.teamA.map((result, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 ${getFormBadgeClass(result)} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {result}
                </div>
              ))}
            </div>
            
            {/* Team B Form */}
            <div className="flex space-x-1.5">
              {formData.teamB.map((result, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 ${getFormBadgeClass(result)} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Head to Head */}
        <div className="mb-7">
          <h3 className="text-center text-lg font-bold mb-4 text-white">HEAD TO HEAD</h3>
          <div className="space-y-4">
            {headToHeadResults.map((result, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm text-gray-400 text-right font-medium">{result.date}</div>
                <div className="flex-1 flex items-center">
                  <div className={`h-3 ${result.teamAColor} rounded-l ml-4 shadow-sm`} style={{ width: '35%' }}></div>
                  <div className="bg-gray-700 px-4 py-2 text-sm font-bold min-w-fit rounded shadow-md text-white">{result.score}</div>
                  <div className={`h-3 ${result.teamBColor} rounded-r shadow-sm`} style={{ width: '35%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Buttons */}
        <div className="flex justify-center items-center space-x-10 mb-7">
          <div className="text-center">
            <BarChart3 className="w-7 h-7 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium tracking-wide">PLAYER STATS</p>
          </div>
          <div className="text-center">
            <Menu className="w-7 h-7 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium tracking-wide">STANDINGS</p>
          </div>
          <div className="text-center">
            <button className="text-teal-400 border-2 border-teal-400 px-4 py-2 rounded-lg font-bold hover:bg-teal-400 hover:text-gray-900 transition-all duration-200 text-xs tracking-wide shadow-md hover:shadow-lg">
              MORE STATS
            </button>
          </div>
        </div>

        {/* AI Summary Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleAISummaryClick}
            disabled={isLoadingSummary}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-3 text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 tracking-wide"
          >
            {isLoadingSummary ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>LOADING...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>AI SUMMARY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Markets Section */}
      <div className="bg-white text-gray-900 px-5 py-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900">MARKETS</h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="font-bold text-lg">B</span>
            <span className="text-sm font-medium tracking-wide">BET BUILDER</span>
          </div>
        </div>
        
        <div className="flex space-x-3 mb-5 overflow-x-auto">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors">All Markets</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-md">Main</button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Team Goals</button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Half</button>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-base text-gray-900">2Up&Win - Early Payout</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <Clock className="w-3 h-3 text-gray-800" />
              </div>
              <span className="text-sm font-bold text-gray-700">B</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">Win if your selection takes a 2 goal lead in 90 minutes</p>
          <div className="flex justify-between items-center gap-4">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700 mb-1 tracking-wide">TEAM A</p>
              <p className="text-lg font-bold text-gray-900">3.10</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700 mb-1 tracking-wide">DRAW</p>
              <p className="text-lg font-bold text-gray-500">-----</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700 mb-1 tracking-wide">TEAM B</p>
              <p className="text-lg font-bold text-gray-900">2.20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 flex justify-around items-center py-4 border-t border-gray-700/50 shadow-lg">
        <div className="text-center">
          <div className="w-6 h-6 mx-auto mb-1 text-gray-400 text-lg font-bold flex items-center justify-center">L</div>
          <p className="text-xs text-gray-400 font-medium">Home</p>
        </div>
        <div className="text-center">
          <Menu className="w-6 h-6 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400 font-medium">Menu</p>
        </div>
        <div className="text-center">
          <CheckSquare className="w-6 h-6 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400 font-medium">My Bets</p>
        </div>
        <div className="text-center">
          <Clock className="w-6 h-6 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400 font-medium">In-Play</p>
        </div>
        <div className="text-center">
          <Gamepad2 className="w-6 h-6 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-400 font-medium">Gaming</p>
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
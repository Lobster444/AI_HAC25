// Parse the response to separate summary and betting suggestion
let summary = fullResponse;
let bettingSuggestion = 'Unable to provide betting analysis.';

if (fullResponse.includes('MATCH SUMMARY:') && fullResponse.includes('GOALS ANALYSIS:')) {
  const parts = fullResponse.split('GOALS ANALYSIS:');
  summary = parts[0].replace('MATCH SUMMARY:', '').trim();
  
  // Handle the goals analysis part which may include reasoning
  let goalsAnalysis = parts[1].trim();
  
  // If there's a "Reasoning:" section, include it in the betting suggestion
  if (goalsAnalysis.includes('Reasoning:')) {
    bettingSuggestion = goalsAnalysis; // Keep the full analysis including reasoning
  } else {
    bettingSuggestion = goalsAnalysis;
  }
}
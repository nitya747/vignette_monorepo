/**
 * Vignette.ai - Performance Log & AI Learning Loop
 * Directs localStorage telemetry to establish a self-improving prompt moat.
 */

const STORAGE_KEY = 'vignette_performance_log';

/**
 * Saves a high-CTR thumbnail generation log entry to create a data moat
 */
export function savePerformanceRecord(record) {
  if (typeof window === 'undefined') return;
  
  try {
    const existingLog = getPerformanceLog();
    
    const newRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      score: record.score || 70,
      niche: record.niche || 'gaming',
      archetype: record.archetype || 'reaction',
      title: record.title || '',
      colorMood: record.colorMood || 'energetic',
      ...record
    };
    
    existingLog.unshift(newRecord);
    
    // Keep only the last 100 entries to manage localStorage space
    const trimmedLog = existingLog.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLog));
  } catch (error) {
    console.error('Failed to save performance record:', error);
  }
}

/**
 * Retrieves the full raw history from local storage
 */
export function getPerformanceLog() {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse performance log:', error);
    return [];
  }
}

/**
 * AI Learning Engine: Scans the log and extracts winning prompt modifiers based on historical success (CTR >85)
 */
export function compileLearningModifiers(niche) {
  const logs = getPerformanceLog();
  
  // Filter for high performers (>85 score) in this specific niche
  const winners = logs.filter(log => log.niche === niche && log.score >= 85);
  
  if (winners.length === 0) {
    return ''; // No data yet
  }
  
  // Analyze dominant successful parameters
  const colorFrequencies = {};
  const archetypeFrequencies = {};
  
  winners.forEach(winner => {
    colorFrequencies[winner.colorMood] = (colorFrequencies[winner.colorMood] || 0) + 1;
    archetypeFrequencies[winner.archetype] = (archetypeFrequencies[winner.archetype] || 0) + 1;
  });
  
  // Find top color mood and archetype
  const topColor = Object.keys(colorFrequencies).reduce((a, b) => colorFrequencies[a] > colorFrequencies[b] ? a : b, '');
  const topArchetype = Object.keys(archetypeFrequencies).reduce((a, b) => archetypeFrequencies[a] > archetypeFrequencies[b] ? a : b, '');
  
  let modifiers = '';
  
  if (topColor) {
    modifiers += `Incorporate successful dynamic ${topColor} accents to boost clickability. `;
  }
  
  if (topArchetype) {
    modifiers += `Structure the focal subjects using the proven successful ${topArchetype} spacing composition.`;
  }
  
  return modifiers.trim();
}

/**
 * Returns structural feedback of successful designs to display in the UI
 */
export function getNicheInsights(niche) {
  const logs = getPerformanceLog();
  const nicheWinners = logs.filter(log => log.niche === niche && log.score >= 80);
  
  if (nicheWinners.length === 0) {
    return {
      message: 'Generating more thumbnails in this niche will unlock AI learning insights.',
      topColors: ['No data yet'],
      averageScore: 0
    };
  }
  
  const totalScore = nicheWinners.reduce((sum, win) => sum + win.score, 0);
  const average = Math.round(totalScore / nicheWinners.length);
  
  const colorList = nicheWinners.map(w => w.colorMood);
  const uniqueColors = [...new Set(colorList)];
  
  return {
    message: `AI has analyzed ${nicheWinners.length} high-CTR designs. Ready to optimize!`,
    topColors: uniqueColors.slice(0, 3),
    averageScore: average
  };
}

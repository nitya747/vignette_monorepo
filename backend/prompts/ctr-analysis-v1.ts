import { CTRCritiqueResponse } from '../src/types/index.js';

/**
 * Generates highly realistic and constructive CTR Roast Critic details based on inputs
 */
export function getMockCTRScore(
  title: string,
  niche: string,
  archetype: string,
  topic: string = '',
  keywords: string = ''
): CTRCritiqueResponse {
  const titleWords = title ? title.split(/\s+/).length : 5;
  const searchText = `${title || ''} ${topic || ''} ${keywords || ''}`.toLowerCase();
  
  // 1. Split the title by dividers first to get segments
  let rawSubject = title ? title.trim() : '';
  let segments: string[] = [];
  if (rawSubject.includes('|')) {
    segments = rawSubject.split('|').map(s => s.trim());
  } else if (rawSubject.includes(' - ')) {
    segments = rawSubject.split(' - ').map(s => s.trim());
  } else if (rawSubject.includes('—')) {
    segments = rawSubject.split('—').map(s => s.trim());
  }
  
  let cleanSubject = rawSubject;
  if (segments.length > 0) {
    const cleanSegment = segments.find(s => !/^(ep\s*\d+|episode\s*\d+|full episode|promo|teaser|clip|live)$/i.test(s));
    if (cleanSegment) {
      cleanSubject = cleanSegment;
    } else {
      cleanSubject = segments[0];
    }
  }

  // If the selected segment STILL contains sub-dividers, split them too
  if (cleanSubject.includes(' - ')) {
    const subsegs = cleanSubject.split(' - ').map(s => s.trim());
    const cleanSub = subsegs.find(s => !/^(ep\s*\d+|episode\s*\d+|full episode|promo|teaser|clip|live)$/i.test(s));
    if (cleanSub) cleanSubject = cleanSub;
  }

  // 2. Clean up common narrative prefixes and suffixes from the selected segment
  cleanSubject = cleanSubject.replace(/^(how to\s+(cook|make|do|build|get|invest in|master|create|learn|find|use|play|stop|start|bake|fry)\s+)/i, '');
  cleanSubject = cleanSubject.replace(/^(how to|how i|why you should|why we|if i had to|if i could|i tried to|i spent)\s+/i, '');
  cleanSubject = cleanSubject.replace(/^(a|an|the|my|our)\s+/i, '');
  cleanSubject = cleanSubject.replace(/\s+(at home|in \d{4}|for beginners|step by step|easy recipe|tutorial|vlog|guide|playlist|video|channel)$/i, '');

  // 3. Intelligently extract tech and coding context topics to provide specialized, elite title suggestions
  let detectedSubject = '';
  let codingContext = '';
  
  if (/\b(dsa|data structure|algorithm)s?\b/i.test(searchText)) {
    detectedSubject = 'DSA';
    codingContext = /\b(intern|placement|job)s?\b/i.test(searchText) ? 'Internships & Jobs' : 'FAANG Placements';
  } else if (/\bleetcode\b/i.test(searchText)) {
    detectedSubject = 'LeetCode';
    codingContext = 'FAANG Placements';
  } else if (/\b(react|nextjs|next\.js)\b/i.test(searchText)) {
    detectedSubject = 'React & Next.js';
    codingContext = 'Web Development';
  } else if (/\b(javascript|js)\b/i.test(searchText)) {
    detectedSubject = 'JavaScript';
    codingContext = 'Web Development';
  } else if (/\bpython\b/i.test(searchText)) {
    detectedSubject = 'Python';
    codingContext = 'Programming';
  } else if (/\bsystem design\b/i.test(searchText)) {
    detectedSubject = 'System Design';
    codingContext = 'Senior Developer Interviews';
  } else if (/\brust\b/i.test(searchText)) {
    detectedSubject = 'Rust';
    codingContext = 'Systems Programming';
  } else if (/\b(web dev|web development|frontend|backend)\b/i.test(searchText)) {
    detectedSubject = 'Web Development';
    codingContext = 'Full-Stack Engineering';
  } else if (/\b(machine learning|ml|ai|deep learning)\b/i.test(searchText)) {
    detectedSubject = 'AI / Machine Learning';
    codingContext = 'Data Science';
  } else if (/\b(learn to code|learn coding|programming|coding)\b/i.test(searchText)) {
    detectedSubject = 'Coding';
    codingContext = 'Software Engineering';
  }

  // 4. Overwrite cleanSubject if high-value tech subject is found, otherwise apply gentle preposition trimming
  if (detectedSubject) {
    cleanSubject = detectedSubject;
  } else {
    // Only strip prepositions if cleanSubject is long, preventing short coherent phrases from being mutilated
    if (cleanSubject.length > 35) {
      cleanSubject = cleanSubject.replace(/\s+(for|at|in|with|to|from|by|of|on)\s+.*$/i, '');
    }
  }

  // Capitalize cleanSubject
  if (cleanSubject) {
    cleanSubject = cleanSubject.trim();
    cleanSubject = cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1);
  } else {
    cleanSubject = 'Creative Content';
  }

  // If the extracted subject is about the thumbnail draft itself, resolve to the actual content theme
  if (cleanSubject.toLowerCase().includes('thumbnail') || cleanSubject.toLowerCase().includes('prompt') || cleanSubject.toLowerCase().includes('draft')) {
    if (searchText.includes('jalebi')) cleanSubject = 'Jalebi';
    else if (searchText.includes('lofi') || searchText.includes('chill') || searchText.includes('sunset')) cleanSubject = 'Lofi Sunset Beats';
    else if (searchText.includes('ski') || searchText.includes('snow') || searchText.includes('mountain')) cleanSubject = 'Extreme Skiing';
    else if (searchText.includes('cook') || searchText.includes('kitchen') || searchText.includes('chef') || searchText.includes('food')) cleanSubject = 'Cooking Recipes';
    else if (searchText.includes('invest') || searchText.includes('stock') || searchText.includes('finance')) cleanSubject = 'Stock Investing';
    else if (searchText.includes('game') || searchText.includes('gaming') || searchText.includes('retro')) cleanSubject = 'Retro Gaming Setup';
    else if (searchText.includes('fit') || searchText.includes('gym') || searchText.includes('workout')) cleanSubject = 'Fitness Challenge';
    else cleanSubject = 'Creative Content';
  }

  // Generate 3 highly contextual and viral titles
  let suggested: string[] = [];
  
  const isSitcom = searchText.includes('taarak') || searchText.includes('mehta') || searchText.includes('ooltah') || searchText.includes('chashmah') || searchText.includes('jethalal') || searchText.includes('sab tv') || (searchText.includes('episode') && (searchText.includes('cooker') || searchText.includes('confusion') || searchText.includes('ep ')));
  const isCooking = !isSitcom && (searchText.includes('cook') || searchText.includes('kitchen') || searchText.includes('chef') || searchText.includes('food') || searchText.includes('recipe') || searchText.includes('jalebi') || searchText.includes('bake') || searchText.includes('fry'));
  const isLofi = searchText.includes('lofi') || searchText.includes('chill') || searchText.includes('ambient') || searchText.includes('sunset') || searchText.includes('music') || searchText.includes('beats');
  const isCodingEdu = !!detectedSubject || searchText.includes('learn to code') || searchText.includes('learn coding') || searchText.includes('dsa') || searchText.includes('programming') || searchText.includes('roadmap') || searchText.includes('leetcode') || searchText.includes('placement') || searchText.includes('internship') || searchText.includes('career') || searchText.includes('developer') || searchText.includes('study') || searchText.includes('genius') || searchText.includes('productivity') || searchText.includes('hack') || searchText.includes('education') || searchText.includes('learn');

  if (isSitcom) {
    const isTaarakMehta = searchText.includes('taarak') || searchText.includes('mehta') || searchText.includes('ooltah') || searchText.includes('chashmah') || searchText.includes('jethalal');
    if (isTaarakMehta) {
      if (searchText.includes('cooker') || searchText.includes('pressure')) {
        suggested = [
          `Jethalal's Pressure Cooker Chaos! (Full Story Explained)`,
          `The Ultimate Pressure Cooker Confusion in Gokuldham!`,
          `Why Jethalal is Terrified of this Pressure Cooker...`
        ];
      } else {
        suggested = [
          `Chaos in Gokuldham Society! (Full Episode Highlight)`,
          `Jethalal's Worst Nightmare Comes True!`,
          `Babita Ji's Shocking Surprise for Jethalal!`
        ];
      }
    } else {
      suggested = [
        `This ${cleanSubject} Moment Changed Everything!`,
        `The Dramatic Truth Behind ${cleanSubject} Revealed`,
        `${cleanSubject} - The Most Shocking Episode Yet!`
      ];
    }
  } else if (isCooking) {
    let dishDescriptor = 'Delicious';
    if (searchText.includes('jalebi') || searchText.includes('samosa') || searchText.includes('fry') || searchText.includes('chips') || searchText.includes('crisp')) {
      dishDescriptor = 'Crispiest';
    } else if (searchText.includes('cake') || searchText.includes('bread') || searchText.includes('muffin') || searchText.includes('dhokla') || searchText.includes('fluffy')) {
      dishDescriptor = 'Fluffiest';
    } else if (searchText.includes('paneer') || searchText.includes('curry') || searchText.includes('gravy') || searchText.includes('soup') || searchText.includes('tasty')) {
      dishDescriptor = 'Tastiest';
    }
    
    suggested = [
      `The Secret to making the ${dishDescriptor} ${cleanSubject} at Home`,
      `How to make perfectly ${dishDescriptor} ${cleanSubject} (Step-by-Step)`,
      `Why your ${cleanSubject} is failing (And how to fix it)`
    ].map(t => t.slice(0, 65));
  } else if (isLofi) {
    suggested = [
      `This Cozy ${cleanSubject} playlist will cure your anxiety...`,
      `1 Hour of Relaxing ${cleanSubject} to Study or Relax`,
      `The Perfect ${cleanSubject} mix for late night driving`
    ].map(t => t.slice(0, 65));
  } else if (isCodingEdu) {
    const ctx = codingContext || 'Internships';
    suggested = [
      `How I’d Learn ${cleanSubject} for ${ctx} (If I Could Start Over)`,
      `The Only ${cleanSubject} Roadmap You Need for ${ctx}`,
      `Stop Memorizing ${cleanSubject}: How to Actually Learn It`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'gaming') {
    suggested = [
      `How to Build the Ultimate 3D ${cleanSubject} Setup`,
      `Can You Actually Master ${cleanSubject} in 24 Hours?`,
      `Why Pro Gamers Choose ${cleanSubject} (Honest Review)`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'finance') {
    suggested = [
      `The ${cleanSubject} Hack the 1% Uses to Grow Wealth`,
      `How to Invest in ${cleanSubject} (Without Losing Money)`,
      `Why Most People Fail at ${cleanSubject} (And How to Win)`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'documentary') {
    suggested = [
      `The Mysterious Rise and Fall of ${cleanSubject}`,
      `Why Nobody Talks About the ${cleanSubject} Incident...`,
      `How ${cleanSubject} Changed the World Forever`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'tech') {
    suggested = [
      `Is the New ${cleanSubject} Actually Worth the Hype?`,
      `Why I Swapped My Entire Setup for ${cleanSubject}`,
      `The Terrifying Future of ${cleanSubject} (Explained)`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'fitness') {
    suggested = [
      `I Tried ${cleanSubject} for 30 Days (Real Results!)`,
      `How to Master ${cleanSubject} in 15 Minutes a Day`,
      `Why your ${cleanSubject} routine isn't working (Fix it now)`
    ].map(t => t.slice(0, 65));
  } else if (niche === 'education') {
    suggested = [
      `How to Study Like a Genius: 10 Productivity Hacks!`,
      `The Ultimate Study Routine of the Top 1% (Scientifically Proven)`,
      `Stop Studying Harder: 10 Hacks to Learn 10x Faster`
    ].map(t => t.slice(0, 65));
  } else {
    suggested = [
      `How to Actually Master ${cleanSubject} (Step-by-Step)`,
      `Why ${cleanSubject} is the Key to Success in 2026`,
      `The Honest Truth About ${cleanSubject} (Does It Work?)`
    ].map(t => t.slice(0, 65));
  }
  
  let score = 72; // baseline
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  const hierarchy: string[] = [];
  
  // Niche strengths/weaknesses
  if (niche === 'finance') {
    strengths.push('Excellent authority design. Clean wealth aesthetics and dark gold lines build high visual trust.');
    suggestions.push('Keep text overlays under 3 words to align with standard high-CTR financial packaging.');
  } else if (niche === 'gaming') {
    strengths.push('Fantastic neon color vibrancy. Saturated background highlights fit gaming grids perfectly.');
    weaknesses.push('High visual noise may cause background clutter at smaller smartphone scales.');
    suggestions.push('Add extreme bokeh blur to background details to isolate the main console/character.');
  } else if (niche === 'documentary') {
    strengths.push('Superb cinematic mood. High-contrast side-lighting creates deep narrative intrigue.');
    suggestions.push('Align main subject on the left third to leave negative space for bold, descriptive keywords.');
  } else if (niche === 'tech') {
    strengths.push('Excellent futuristic styling. Electric cyan and pink rim lights create premium gadget energy.');
    weaknesses.push('Highly complex background grid details could clash with clean typography overlay outlines.');
    suggestions.push('Add a dark vignette border to direct the eyes immediately to the central tech hardware.');
  } else if (niche === 'fitness') {
    strengths.push('Outstanding kinetic framing. High physical action contrast provides strong athletic energy.');
    weaknesses.push('Subject framing blends too much with white snow or sky details in the background.');
    suggestions.push('Add a bold color rim light to separate the physical athlete silhouette from backdrop slopes.');
  } else if (niche === 'education') {
    strengths.push('Superb focused study environment. The glowing laptop reflection and whiteboard formula background create an incredibly high psychological authority.');
    weaknesses.push('The dark chiaroscuro lighting needs strong glow accents around the subject silhouette to pop on high-density YouTube recommendation grids.');
    suggestions.push('Add a vibrant electric brain outline or rim glow around the head to enhance the study genius aesthetic.');
  }

  // Archetype rules
  if (archetype === 'reaction') {
    score += 8;
    strengths.push('Proven reaction composition. Macro close-up face is psychologically engineered to drive clickability.');
    hierarchy.push('Primary: High-emotion human facial expression (left-third focal point)');
    hierarchy.push('Secondary: Central glowing curiosity object (middle third)');
  } else if (archetype === 'versus') {
    score += 6;
    strengths.push('Clear comparison layout. Center neon split line sets up immediate psychological conflict.');
    hierarchy.push('Primary: Dynamic center neon split boundary');
    hierarchy.push('Secondary: Left-side vs Right-side comparative subjects');
  } else if (archetype === 'hero') {
    score += 4;
    strengths.push('Clean hero isolation. Centralized single subject stands out with excellent geometric weight.');
    hierarchy.push('Primary: Highly illuminated central hero subject');
    hierarchy.push('Secondary: Out-of-focus background atmospheric rim light');
  } else {
    score += 2;
    strengths.push('High curiosity gap. Symmetrical glowing outline shape effectively triggers search interest.');
    hierarchy.push('Primary: Glowing abstract central silhouette symbol');
    hierarchy.push('Secondary: Moody fog and deep background shadows');
  }

  // Title rules
  if (titleWords > 10) {
    score -= 8;
    weaknesses.push('Title exceeds 10 words. Long titles get truncated in recommended feeds, reducing scanability.');
    suggestions.push('Shorten title by 3-4 words. Shift secondary details into the thumbnail typography instead.');
  } else if (titleWords < 3) {
    score -= 4;
    weaknesses.push('Title is critically short. Fails to establish clear context or intrigue.');
    suggestions.push('Add 1-2 curiosity-inducing words or active verbs to complete the sentence.');
  } else {
    score += 6;
    strengths.push('Optimal title length. Title is highly scanable at standard YouTube homepage speeds.');
  }

  // General fallback suggestions if we need to make sure we always have enough
  if (suggestions.length === 0) {
    suggestions.push('Ensure background blur is at least 35% to separate visual layers.');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Minor detail safe-zone warning: Bottom-right quadrant has negative elements near duration badges.');
    suggestions.push('Keep key graphical details clear of the standard bottom-right duration badge area.');
  }

  score = Math.max(35, Math.min(95, score));
  
  return {
    score,
    strengths,
    weaknesses,
    suggestions,
    roast: [...strengths, ...weaknesses, ...suggestions],
    attentionHierarchy: hierarchy,
    suggestedTitles: suggested
  };
}

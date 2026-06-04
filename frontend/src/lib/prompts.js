/**
 * Vignette.ai - Thumbnail Psychology Prompt Engine
 * Curates structured prompts based on niches, design archetypes, safe zones,
 * and handles smart text prompts and mock performance feedback metadata.
 */

export const NICHES = {
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    style: 'High-saturation, highly dramatic contrast, vibrant rim lighting, cinematic action, bold intense colors, glowing game elements, extreme dynamic visual highlights, 3D render styling, cinematic ambient occlusion, volumetric cybernetic glows, HDR details.',
    description: 'High energy, glowing neon, action-packed visual style.'
  },
  finance: {
    id: 'finance',
    name: 'Finance / Business',
    style: 'Sleek professional studio setting, premium wealth and growth aesthetics, trust-building deep navy and gold color palette, clean growth charts, subtle gradient background, crisp focus on premium subjects, soft key lighting (5500k color temperature), volumetric back-glow, high-fidelity professional photography.',
    description: 'Professional, trustworthy, clean, gold and dark blue tones.'
  },
  documentary: {
    id: 'documentary',
    name: 'Documentary / Storytelling',
    style: 'Cinematic dramatic lighting, high emotional depth, dramatic side-lighting, organic moody color grade, high-fidelity storytelling composition, deep atmospheric depth of field, award-winning photography look, volumetric god rays, soft atmospheric haze, deep volumetric shadows, chiaroscuro lighting.',
    description: 'Cinematic, moody, story-focused, high emotional depth.'
  },
  tech: {
    id: 'tech',
    name: 'Tech / Gadgets',
    style: 'Futuristic neon gradients, glowing tech gadgets, holographic data elements, clean ultra-dark background, sharp high-tech metal reflections, electric blue and hot pink rim lights, raytraced metallic accents, volumetric light beams, sharp reflection highlights.',
    description: 'Futuristic, high-contrast, glowing gadget profiles.'
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness / Athletics',
    style: 'High-energy athletic focus, raw sweat and muscular texture, dynamic powerful sweat shadows, motivational side-lit body highlights, high physical action contrast, high-speed camera capture, hard rim highlights, gritty dramatic contrast, volumetric backlighting.',
    description: 'High grit, raw sweat, powerful shadows, active dynamic focus.'
  },
  education: {
    id: 'education',
    name: 'Education / Productivity',
    style: 'Moody cinematic study setting, intense focused student leaning over a glowing screen with visible sweat and concentration, background featuring a large chalkboard or whiteboard filled with complex physics and mathematical equations, a glowing volumetric blue electric brain outline and cerebral energy waves radiating around the head, dramatic chiaroscuro key lighting, deep atmospheric depth of field, high-contrast storytelling.',
    description: 'Moody focused study, complex equations, glowing brain energy outline.'
  }
};

export const ARCHETYPES = {
  reaction: {
    id: 'reaction',
    name: 'Reaction / Emotion',
    composition: {
      standard: 'An extreme macro close-up of a human face with an exaggerated expressive expression of wide-eyed curiosity and shock. The face dominates 50% of the frame on the left-side (left third of image), looking right at a glowing focal point in the middle third. Captured on an 85mm f/1.4 lens, razor-sharp focus on the eyes, cinematic shallow depth of field, detailed facial expressions.',
      vertical: 'An extreme macro close-up of a human face with an exaggerated expressive expression of wide-eyed curiosity and shock. The face dominates the upper half of vertical frame, looking down at a central glowing focus. Captured on an 85mm f/1.4 lens, razor-sharp focus on the eyes, cinematic shallow depth of field, detailed facial expressions.',
      square: 'An extreme macro close-up of a human face with an exaggerated expressive expression of wide-eyed curiosity and shock. The face is a center-aligned square frame, with visual focus concentrated in the middle 70% bounds. Captured on an 85mm f/1.4 lens, razor-sharp focus on the eyes, cinematic shallow depth of field, detailed facial expressions.'
    },
    textSafeZone: {
      standard: 'The top-left quadrant of the frame is a flat, dark, simple negative space with no details, specifically reserved for a text layer.',
      vertical: 'The top-center region is a flat, dark, simple negative space with no details, specifically reserved for a text layer.',
      square: 'The top-center quadrant of the frame is a flat, dark, simple negative space with no details, specifically reserved for a text layer.'
    },
    description: 'Expressive close-up face dominating one side to build an emotional hook.'
  },
  versus: {
    id: 'versus',
    name: 'Versus (Comparison)',
    composition: {
      standard: 'A sharp, symmetrical split screen. The left side features a bright, high-energy colored visual with an expressive subject; the right side features a highly contrasting dark, moody visual with opposing subject. A vertical neon energy line splits the center. Captured on a wide-angle 24mm f/2.8 lens, hyper-sharp details across both halves, crisp deep-focus separation.',
      vertical: 'A sharp, symmetrical vertical split screen. The upper half features a bright, high-energy colored visual with an expressive subject; the lower half features a highly contrasting dark, moody visual with opposing subject. A horizontal neon energy line splits the center. Captured on a wide-angle 24mm f/2.8 lens, hyper-sharp details across both halves, crisp deep-focus separation.',
      square: 'A sharp, symmetrical split screen. The left side features a bright, high-energy colored visual with an expressive subject; the right side features a highly contrasting dark, moody visual with opposing subject. A vertical neon energy line splits the center. Captured on a wide-angle 24mm f/2.8 lens, hyper-sharp details across both halves, crisp deep-focus separation.'
    },
    textSafeZone: {
      standard: 'The top-center region is a simple gradient, providing high-contrast negative space for text overlays.',
      vertical: 'The middle-horizontal strip is a simple dark overlay bar, providing high-contrast negative space for text overlays.',
      square: 'The top-center region is a simple gradient, providing high-contrast negative space for text overlays.'
    },
    description: 'Symmetrical comparison split to build curiosity or conflict.'
  },
  hero: {
    id: 'hero',
    name: 'Hero Subject',
    composition: {
      standard: 'A single, high-fidelity hero subject stands crisply in the center of the frame, isolated by a clean, heavily blurred background with a vibrant colored neon rim light highlighting its outer edges. Shot on a 50mm f/1.2 portrait lens, intense bokeh background separation, professional studio subject-isolation.',
      vertical: 'A single, high-fidelity hero subject stands crisply in the center of the frame, isolated by a clean, heavily blurred background with a vibrant colored neon rim light highlighting its outer edges. Shot on a 50mm f/1.2 portrait lens, intense bokeh background separation, professional studio subject-isolation.',
      square: 'A single, high-fidelity hero subject stands crisply in the center of the frame, isolated by a clean, heavily blurred background with a vibrant colored neon rim light highlighting its outer edges. Shot on a 50mm f/1.2 portrait lens, intense bokeh background separation, professional studio subject-isolation.'
    },
    textSafeZone: {
      standard: 'The top-left and top-right quadrants are clean negative space, perfect for bold typography.',
      vertical: 'The top-center and bottom-center regions are clean negative space, perfect for bold typography.',
      square: 'The top-left and top-right quadrants are clean negative space, perfect for bold typography.'
    },
    description: 'Clean central focus on a single object or product.'
  },
  question: {
    id: 'question',
    name: 'Burning Question',
    composition: {
      standard: 'An abstract, mysterious, and high-intrigue setting. A central glowing outline or question mark shape emerges from deep shadows, creating a compelling curiosity gap with deep atmospheric fog. Shot on a 35mm f/1.8 cinematic lens, high atmospheric depth, misty volume rays, soft mystery framing.',
      vertical: 'An abstract, mysterious, and high-intrigue setting. A central glowing outline or question mark shape emerges from deep shadows, creating a compelling curiosity gap with deep atmospheric fog. Shot on a 35mm f/1.8 cinematic lens, high atmospheric depth, misty volume rays, soft mystery framing.',
      square: 'An abstract, mysterious, and high-intrigue setting. A central glowing outline or question mark shape emerges from deep shadows, creating a compelling curiosity gap with deep atmospheric fog. Shot on lane-wide 35mm f/1.8 cinematic lens, high atmospheric depth, misty volume rays, soft mystery framing.'
    },
    textSafeZone: {
      standard: 'The entire upper half of the image is a simple dark fog gradient, ensuring overlay text pops.',
      vertical: 'The upper third of the vertical image is a simple dark fog gradient, ensuring overlay text pops.',
      square: 'The entire upper half of the image is a simple dark fog gradient, ensuring overlay text pops.'
    },
    description: 'Intriguing, abstract composition creating a high curiosity gap.'
  }
};

// Curated High-Fidelity Mock Images to represent Nanobanana 2 Flash generations in Niche/Archetype combos
export const MOCK_THUMBNAILS = {
  'gaming-reaction': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1280&h=720',
  'gaming-versus': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1280&h=720',
  'gaming-hero': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1280&h=720',
  'gaming-question': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1280&h=720',
  
  'finance-reaction': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1280&h=720',
  'finance-versus': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1280&h=720',
  'finance-hero': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1280&h=720',
  'finance-question': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1280&h=720',
  
  'documentary-reaction': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1280&h=720',
  'documentary-versus': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1280&h=720',
  'documentary-hero': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1280&h=720',
  'documentary-question': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1280&h=720',
  
  'tech-reaction': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1280&h=720',
  'tech-versus': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1280&h=720',
  'tech-hero': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1280&h=720',
  'tech-question': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1280&h=720',
  
  'fitness-reaction': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1280&h=720',
  'fitness-versus': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1280&h=720',
  'fitness-hero': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1280&h=720',
  'fitness-question': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1280&h=720',
  
  'education-reaction': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-versus': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-hero': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-question': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1280&h=720',
};

// Dynamic local fallback mock image list if custom strings are used
const FALLBACK_NICHE_IMAGES = {
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1280&h=720',
  finance: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1280&h=720',
  documentary: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1280&h=720',
  tech: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1280&h=720',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1280&h=720',
  education: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1280&h=720',
};

// eslint-disable-next-line no-unused-vars
export function compilePrompt({ title, topic, keywords, niche, archetype, aspectRatio = '16:9', learningModifiers = '', usePhoto = false }) {
  return (title || topic || '').trim();
}

/**
 * Returns a high-fidelity mock image for the requested combination
 */
export function getMockImageUrl(niche, archetype, aspectRatio = '16:9') {
  const key = `${niche}-${archetype}`;
  const rawUrl = MOCK_THUMBNAILS[key] || FALLBACK_NICHE_IMAGES[niche] || FALLBACK_NICHE_IMAGES.gaming;
  if (aspectRatio === '9:16') {
    return rawUrl.replace('w=1280&h=720', 'w=720&h=1280');
  } else if (aspectRatio === '4:5') {
    return rawUrl.replace('w=1280&h=720', 'w=1080&h=1350');
  }
  return rawUrl;
}

/**
 * Generates highly realistic and constructive CTR Roast Critic details based on inputs
 */
export function getMockCTRScore(title, niche, archetype, topic = '', keywords = '') {
  niche = niche || 'education';
  archetype = archetype || 'hero';

  const titleWords = title ? title.split(/\s+/).length : 5;
  const searchText = `${title || ''} ${topic || ''} ${keywords || ''}`.toLowerCase();
  
  // 1. Split the title by dividers first to get segments and prevent truncation of first segment prepositions
  let rawSubject = title ? title.trim() : '';
  let segments = [];
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
  let suggested;
  
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
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const hierarchy = [];
  
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

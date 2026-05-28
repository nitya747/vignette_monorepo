import { NicheInfo, ArchetypeInfo, CompilePromptPayload } from '../src/types/index.js';

export const NICHES: Record<string, NicheInfo> = {
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    style: 'High-saturation, highly dramatic contrast, vibrant rim lighting, cinematic action, bold intense colors, glowing game elements, extreme dynamic visual highlights, 3D render styling.',
    description: 'High energy, glowing neon, action-packed visual style.'
  },
  finance: {
    id: 'finance',
    name: 'Finance / Business',
    style: 'Sleek professional studio setting, premium wealth and growth aesthetics, trust-building deep navy and gold color palette, clean growth charts, subtle gradient background, crisp focus on premium subjects.',
    description: 'Professional, trustworthy, clean, gold and dark blue tones.'
  },
  documentary: {
    id: 'documentary',
    name: 'Documentary / Storytelling',
    style: 'Cinematic dramatic lighting, high emotional depth, dramatic side-lighting, organic moody color grade, high-fidelity storytelling composition, deep atmospheric depth of field, award-winning photography look.',
    description: 'Cinematic, moody, story-focused, high emotional depth.'
  },
  tech: {
    id: 'tech',
    name: 'Tech / Gadgets',
    style: 'Futuristic neon gradients, glowing tech gadgets, holographic data elements, clean ultra-dark background, sharp high-tech metal reflections, electric blue and hot pink rim lights.',
    description: 'Futuristic, high-contrast, glowing gadget profiles.'
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness / Athletics',
    style: 'High-energy athletic focus, raw sweat and muscular texture, dynamic powerful sweat shadows, motivational side-lit body highlights, high physical action contrast, high-speed camera capture.',
    description: 'High grit, raw sweat, powerful shadows, active dynamic focus.'
  }
};

export const ARCHETYPES: Record<string, ArchetypeInfo> = {
  reaction: {
    id: 'reaction',
    name: 'Reaction / Emotion',
    composition: 'An extreme macro close-up of a human face with an exaggerated expressive expression of wide-eyed curiosity and shock. The face dominates 50% of the frame on the left-side (left third of image), looking right at a glowing focal point in the middle third.',
    textSafeZone: 'The top-left quadrant of the frame is a flat, dark, simple negative space with no details, specifically reserved for a text layer.',
    description: 'Expressive close-up face dominating one side to build an emotional hook.'
  },
  versus: {
    id: 'versus',
    name: 'Versus (Comparison)',
    composition: 'A sharp, symmetrical split screen. The left side features a bright, high-energy colored visual with an expressive subject; the right side features a highly contrasting dark, moody visual with opposing subject. A vertical neon energy line splits the center.',
    textSafeZone: 'The top-center region is a simple gradient, providing high-contrast negative space for text overlays.',
    description: 'Symmetrical comparison split to build curiosity or conflict.'
  },
  hero: {
    id: 'hero',
    name: 'Hero Subject',
    composition: 'A single, high-fidelity hero subject stands crisply in the center of the frame, isolated by a clean, heavily blurred background with a vibrant colored neon rim light highlighting its outer edges.',
    textSafeZone: 'The top-left and top-right quadrants are clean negative space, perfect for bold typography.',
    description: 'Clean central focus on a single object or product.'
  },
  question: {
    id: 'question',
    name: 'Burning Question',
    composition: 'An abstract, mysterious, and high-intrigue setting. A central glowing outline or question mark shape emerges from deep shadows, creating a compelling curiosity gap with deep atmospheric fog.',
    textSafeZone: 'The entire upper half of the image is a simple dark fog gradient, ensuring overlay text pops.',
    description: 'Intriguing, abstract composition creating a high curiosity gap.'
  }
};

export const MOCK_THUMBNAILS: Record<string, string> = {
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
};

const FALLBACK_NICHE_IMAGES: Record<string, string> = {
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1280&h=720',
  finance: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1280&h=720',
  documentary: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1280&h=720',
  tech: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1280&h=720',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1280&h=720',
};

/**
 * Compiles a structured, highly psychological prompt optimized for high CTR
 */
export function compilePrompt({ title, topic, keywords, niche, archetype, aspectRatio = '16:9', learningModifiers = '' }: CompilePromptPayload): string {
  const selectedNiche = NICHES[niche] || NICHES.gaming;
  const selectedArchetype = ARCHETYPES[archetype] || ARCHETYPES.reaction;
  
  // Enforce Rule of 3 visual elements
  const compositionLimit = 'Strictly limit the frame to a maximum of 3 visual elements: 1 primary focal subject, 1 secondary supporting object or neon accent element, and 1 clean highly blurred background scene.';
  
  // Format details from video inputs
  const subjectDescription = `The primary subject matter represents: ${topic || 'creative content'} related to '${title || 'video topic'}'. Use keywords: ${keywords || 'none'}.`;

  // Construct complete psychological prompt
  if (aspectRatio === '9:16') {
    const verticalComposition = selectedArchetype.composition.replace(
      'left-side (left third of image), looking right at a glowing focal point in the middle third',
      'upper half of vertical frame, looking down at a central glowing focus'
    );
    const verticalTextSafe = selectedArchetype.textSafeZone.replace('top-left quadrant', 'top-center region');
    return `YouTube Shorts vertical video frame, 9:16 aspect ratio, vertical composition, 720x1280. ${verticalComposition} ${selectedNiche.style} ${subjectDescription} ${compositionLimit} ${verticalTextSafe} Ultra-high contrast, vivid professional studio lighting, rim-lit silhouettes, heavily blurred background depth of field to make the foreground pop at small sizes. No watermarks, no cluttered elements, no text or symbols in the bottom-right corner. ${learningModifiers}`;
  }

  return `YouTube thumbnail, 16:9 aspect ratio, 1280x720. ${selectedArchetype.composition} ${selectedNiche.style} ${subjectDescription} ${compositionLimit} ${selectedArchetype.textSafeZone} Ultra-high contrast, vivid professional studio lighting, rim-lit silhouettes, heavily blurred background depth of field to make the foreground pop at small sizes. No watermarks, no cluttered elements, no text or symbols in the bottom-right corner. ${learningModifiers}`;
}

/**
 * Returns a high-fidelity mock image for the requested combination
 */
export function getMockImageUrl(niche: string, archetype: string, aspectRatio: '16:9' | '9:16' = '16:9'): string {
  const key = `${niche}-${archetype}`;
  const rawUrl = MOCK_THUMBNAILS[key] || FALLBACK_NICHE_IMAGES[niche] || FALLBACK_NICHE_IMAGES.gaming;
  if (aspectRatio === '9:16') {
    return rawUrl.replace('w=1280&h=720', 'w=720&h=1280');
  }
  return rawUrl;
}

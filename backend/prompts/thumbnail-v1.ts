import { NicheInfo, ArchetypeInfo, CompilePromptPayload } from '../src/types/index.js';

export const NICHES: Record<string, NicheInfo> = {
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

export const ARCHETYPES: Record<string, ArchetypeInfo> = {
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

  'education-reaction': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-versus': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-hero': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1280&h=720',
  'education-question': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1280&h=720',
};

const FALLBACK_NICHE_IMAGES: Record<string, string> = {
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1280&h=720',
  finance: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1280&h=720',
  documentary: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1280&h=720',
  tech: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1280&h=720',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1280&h=720',
  education: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1280&h=720',
};

/**
 * Preprocesses titles to extract clean visual nouns, preventing text-bleed bugs.
 */
function extractVisualSubject(title: string): string {
  if (!title) return 'creative subject';
  
  // Clean YouTube separators (| , - , —) and emojis
  let subject = title.split(/[|\-—]/)[0].replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
  
  // Clean clickbait action prefixes
  subject = subject.replace(/^(how to|why you should|i tried to|i spent|this is why|what happens if|is this the)\s+/i, '');
  
  // Clean common video suffixes
  subject = subject.replace(/\s+(at home|in \d{4}|for beginners|tutorial|vlog|guide|playlist|video|channel|revealed)$/i, '');
  
  return subject.trim();
}

/**
 * Compiles a structured, highly psychological prompt optimized for high CTR
 */
export function compilePrompt({ title, topic, keywords, niche, archetype, aspectRatio = '16:9', learningModifiers = '', usePhoto = false }: CompilePromptPayload): string {
  const subject = title || topic || '';
  return `Generate a pro youtube thumbnail for the topic: "${subject}".`;
}

/**
 * Returns a high-fidelity mock image for the requested combination
 */
export function getMockImageUrl(niche: string, archetype: string, aspectRatio: '16:9' | '9:16' | '4:5' = '16:9'): string {
  const key = `${niche}-${archetype}`;
  const rawUrl = MOCK_THUMBNAILS[key] || FALLBACK_NICHE_IMAGES[niche] || FALLBACK_NICHE_IMAGES.gaming;
  if (aspectRatio === '9:16') {
    return rawUrl.replace('w=1280&h=720', 'w=720&h=1280');
  } else if (aspectRatio === '4:5') {
    return rawUrl.replace('w=1280&h=720', 'w=1080&h=1350');
  }
  return rawUrl;
}

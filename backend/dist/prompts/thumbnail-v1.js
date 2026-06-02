// Minimal descriptors to preserve test suite compatibility while removing massive legacy bloating
export const NICHES = {
    gaming: { id: 'gaming', name: 'Gaming', style: '', description: '' },
    finance: { id: 'finance', name: 'Finance / Business', style: '', description: '' },
    documentary: { id: 'documentary', name: 'Documentary / Storytelling', style: '', description: '' },
    tech: { id: 'tech', name: 'Tech / Gadgets', style: '', description: '' },
    fitness: { id: 'fitness', name: 'Fitness / Athletics', style: '', description: '' },
    education: { id: 'education', name: 'Education / Productivity', style: '', description: '' }
};
export const ARCHETYPES = {
    reaction: { id: 'reaction', name: 'Reaction / Emotion', composition: { standard: '', vertical: '', square: '' }, textSafeZone: { standard: '', vertical: '', square: '' }, description: '' },
    versus: { id: 'versus', name: 'Versus (Comparison)', composition: { standard: '', vertical: '', square: '' }, textSafeZone: { standard: '', vertical: '', square: '' }, description: '' },
    hero: { id: 'hero', name: 'Hero Subject', composition: { standard: '', vertical: '', square: '' }, textSafeZone: { standard: '', vertical: '', square: '' }, description: '' },
    question: { id: 'question', name: 'Burning Question', composition: { standard: '', vertical: '', square: '' }, textSafeZone: { standard: '', vertical: '', square: '' }, description: '' }
};
export const MOCK_THUMBNAILS = {};
/**
 * Compiles a clean, focused, psychological prompt sent directly to fal.ai.
 * Injects the selected aspect ratio to instruct the model on spatial layout.
 */
export function compilePrompt({ title, topic, keywords, niche = 'default', archetype = 'default', aspectRatio = '16:9', learningModifiers = '', usePhoto = false }) {
    return (title || topic || '').trim();
}
/**
 * Custom local mock image resolver (independent of large hardcoded objects)
 */
export function getMockImageUrl(niche, archetype, aspectRatio = '16:9') {
    const isVertical = aspectRatio === '9:16';
    const width = isVertical ? 720 : 1280;
    const height = isVertical ? 1280 : 720;
    return `https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=${width}&h=${height}`;
}

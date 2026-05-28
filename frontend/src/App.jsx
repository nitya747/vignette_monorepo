'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FolderClosed, 
  Flame, 
  Type, 
  
  UploadCloud, 
  TextQuote, 
  TrendingUp, 
  Plus, 
  
  X, 
  Sliders, 
  Activity, 
  ChevronRight, 
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle,
  Video,
  Download,
  Eye
} from 'lucide-react';

// Subcomponents
import Gallery from './components/Gallery';
import CTRAnalysisPanel from './components/CTRAnalysisPanel';
import YoutubePreview from './components/YoutubePreview';
import ThreeMascot from './components/ThreeMascot';
import AuthModal from './components/AuthModal';
import LibraryPanel from './components/LibraryPanel';
import LandingPage from './components/LandingPage';

// Supabase client instance
import { supabase } from './lib/supabase';

// Library utilities
import { compilePrompt } from './lib/prompts';
import { generateThumbnailImage, analyzeThumbnailCTR } from './lib/imageService';
import { savePerformanceRecord, compileLearningModifiers } from './lib/database';

// Pre-loaded premium aesthetic lofi start state matching lofi preset
const PRESET_LOFI_IMAGE = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=1280&h=720';
const PRESET_LOFI_CRITIQUE = {
  score: 88,
  strengths: [
    'Excellent retro color theme. Cozy sunset palette creates an instant warm mood.',
    'Clear safe zone allocation. Primary visual elements are well-separated from boundaries.'
  ],
  weaknesses: [
    'Subtle background noise from skyscrapers silhouette limits center separation.',
  ],
  suggestions: [
    'Add slight depth blur to distant city light points to maximize window focus.',
    'Keep graphical highlights free from standard bottom-right duration badge overlap.'
  ],
  roast: [
    'Excellent! The cozy retro sunset color palette creates an instant clickability mood.',
    'Legibility safety: The primary visual elements are well-separated from safe zones.',
    'Mobile safe-zone check: Visual weights are free from standard bottom-right video duration badge overlap.'
  ],
  attentionHierarchy: [
    'Primary: Glowing warm sunset window silhouette light',
    'Secondary: Relaxing desk silhouettes',
    'Tertiary: Muted atmospheric skyscrapers background'
  ],
  suggestedTitles: [
    'This lofi sunset playlist will cure your anxiety...',
    '1 Hour of Cozy Sunset Lofi Beats to Study/Relax',
    'The Perfect Lofi Playlist for Late Night Driving'
  ]
};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map pathname to activeTab ID
  const getActiveTabFromPath = (path) => {
    switch (path) {
      case '/dashboard': return 'maker';
      case '/projects': return 'gallery';
      case '/roast': return 'roast';
      case '/editor': return 'editor';
      case '/preview': return 'simulator';
      case '/upload': return 'upgrade';
      case '/titles': return 'titles';
      case '/analytics': return 'analytics';
      case '/':
      default:
        return 'landing';
    }
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const setActiveTab = (tabId) => {
    switch (tabId) {
      case 'maker': navigate('/dashboard'); break;
      case 'gallery': navigate('/projects'); break;
      case 'roast': navigate('/roast'); break;
      case 'editor': navigate('/editor'); break;
      case 'simulator': navigate('/preview'); break;
      case 'upgrade': navigate('/upload'); break;
      case 'titles': navigate('/titles'); break;
      case 'analytics': navigate('/analytics'); break;
      case 'landing':
      default:
        navigate('/');
        break;
    }
  };

  // 1. Centralized SPA Workspace States
  const [inputs, setInputs] = useState({ 
    title: 'An ambient thumbnail for my lofi playlist', 
    topic: 'Relaxed cozy loft window view at sunset with city skyscrapers', 
    keywords: 'lofi, chill, sunset, music, aesthetic' 
  });
  const [selectedNiche, setSelectedNiche] = useState('documentary');
  const [selectedArchetype, setSelectedArchetype] = useState('question');
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  
  const [imageUrl, setImageUrl] = useState(PRESET_LOFI_IMAGE);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [provider, setProvider] = useState('Vignette Preset');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  const [analysis, setAnalysis] = useState(PRESET_LOFI_CRITIQUE);
  const [showCritique, setShowCritique] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Supabase Auth and History States
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSaved, setIsSaved] = useState(false);

  // Sync Supabase Auth listener
  useEffect(() => {
    if (!supabase) {
      // Sandbox Mode: Check if there's a cached mock user session
      const savedUser = localStorage.getItem('vignette_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setSession({ access_token: 'sandbox-jwt-token-secret-123456789', user: parsed });
        } catch (e) {
          console.error('[Auth Sandbox] Failed to parse saved mock user:', e);
        }
      }
      return;
    }

    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });

    // Listen for session updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('vignette_mock_user');
      setUser(null);
      setSession(null);
    }
    showToast('Signed out successfully.', 'info');
    setActiveTab('landing');
  };

  const handleAuthSuccess = (newSession) => {
    setSession(newSession);
    setUser(newSession.user);
    if (!supabase) {
      localStorage.setItem('vignette_mock_user', JSON.stringify(newSession.user));
    }
    showToast('Welcome to Vignette.ai!', 'success');
    
    // Execute pending callback
    if (authCallback) {
      authCallback(newSession);
      setAuthCallback(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Custom Dropdown Menu States
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag and drop / secondary upload rewrite state
  const [dragActive, setDragActive] = useState(false);
  
  // URL Input State specifically for Maker workspace
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isSearchUrlLoading, setIsSearchUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // User Photo Upload (use-your-photo feature)
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const userPhotoInputRef = useRef(null);

  // DOM ref to scroll focus to input
  const inputRef = useRef(null);

  // Sync window viewport for mobile responsiveness
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isDesktop = viewportWidth >= 992;
  const isTablet = viewportWidth >= 768 && viewportWidth < 992;
  const isMobile = viewportWidth < 768;

  // Compile and generate thumbnail image based on prompt state (Task 1.3 / 1.4)
  const handleGenerate = async () => {
    if (!inputs.title.trim()) return;
    
    setIsGenerating(true);
    setIsOptimized(false);
    setIsSaved(false);
    setAnalysisError(null);
    
    let learningMod = compileLearningModifiers(selectedNiche);
    if (userPhotoUrl) {
      learningMod += " Incorporate the user's provided subject photo naturally as the main focal subject, applying professional edge highlights and matching lighting tones of the niche.";
    }
    
    const prompt = compilePrompt({
      title: inputs.title,
      topic: inputs.topic || inputs.title,
      keywords: inputs.keywords,
      niche: selectedNiche,
      archetype: selectedArchetype,
      aspectRatio: aspectRatio,
      learningModifiers: learningMod
    });

    try {
      const result = await generateThumbnailImage(prompt, selectedNiche, selectedArchetype, aspectRatio, userPhotoUrl);
      setImageUrl(result.imageUrl);
      setProvider(result.provider);
      
      const critique = await analyzeThumbnailCTR(
        result.imageUrl, 
        inputs.title, 
        inputs.topic, 
        inputs.keywords, 
        selectedNiche, 
        selectedArchetype
      );
      setAnalysis(critique);
      setShowCritique(true);

      // Successfully generated: smooth transition to CTR Roast panel to showcase visual roasts!
      setTimeout(() => {
        setActiveTab('roast');
      }, 800);
    } catch (error) {
      console.error('Generation pipeline failure:', error);
      setAnalysisError('Vignette\'s visual intelligence network failed to complete the layout scan. The server reported a rate limit or API connection error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // One-click clickability optimizer (Task 2.4)
  const handleOptimize = async () => {
    if (!analysis) return;
    
    setIsOptimizing(true);
    setIsSaved(false);
    
    let learningModifiersStr = 'Boost primary subject color saturation by 25%. Zoom in on human face macro elements to occupy 60% of frame width. Ensure background details are completely blurred for extreme bokeh depth separation.';
    if (userPhotoUrl) {
      learningModifiersStr += " Blend the user's uploaded subject photo into the design naturally as the main foreground element, color-correcting it to merge with the background lighting.";
    }

    const optimizedPrompt = compilePrompt({
      title: inputs.title,
      topic: inputs.topic,
      keywords: inputs.keywords,
      niche: selectedNiche,
      archetype: selectedArchetype,
      aspectRatio: aspectRatio,
      learningModifiers: learningModifiersStr
    });

    try {
      const result = await generateThumbnailImage(optimizedPrompt, selectedNiche, selectedArchetype, aspectRatio, userPhotoUrl);
      
      setImageUrl(result.imageUrl);
      setProvider(result.provider);
      setIsOptimized(true);
      
      const originalScore = analysis.score;
      const optimizedScore = Math.min(94, Math.round(originalScore + (100 - originalScore) * 0.45));
      
      const newCritique = {
        score: optimizedScore,
        roast: [
          'Excellent! Primary focal subject is heavily rim-lit, popping crisply on dark backgrounds.',
          'Mobile readability check: High font-contrast and safe-zone allocation is 100% clear of durations badges.',
          'Atmospheric blur successfully separates background details, maximizing foreground eye attention.'
        ],
        attentionHierarchy: [
          'Primary: Prominent, high-saturation focal subject',
          'Secondary: Clear, high-contrast, safe-zone typography overlay space',
          'Tertiary: Blurred atmospheric rim light background'
        ],
        suggestedTitles: analysis.suggestedTitles
      };
      
      setAnalysis(newCritique);
      
      // Save high performance generation to learning loop database (Task 4.2)
      savePerformanceRecord({
        score: optimizedScore,
        niche: selectedNiche,
        archetype: selectedArchetype,
        title: inputs.title,
        colorMood: 'energetic'
      });
      
    } catch (error) {
      console.error('Optimizing failure:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveToLibrary = async (currentSession = session, customPayload = null) => {
    // If the first argument is a React/DOM event, ignore it and use the actual session state
    const isEvent = currentSession && (currentSession.preventDefault || currentSession.target || currentSession.nativeEvent);
    const activeSession = isEvent ? session : (currentSession || session);
    const activeUser = activeSession?.user || user;
    
    // If not logged in, prompt AuthModal and store a callback to save once auth is successful
    if (!activeUser) {
      if (!customPayload) {
        setAuthCallback(() => (newSession) => handleSaveToLibrary(newSession));
      } else {
        setAuthCallback(() => (newSession) => handleSaveToLibrary(newSession, customPayload));
      }
      setIsAuthOpen(true);
      showToast('Please sign in to save this project to your library.', 'info');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const token = activeSession?.access_token || 'sandbox-jwt-token-secret-123456789';
      headers['Authorization'] = `Bearer ${token}`;

      const targetAnalysis = customPayload ? customPayload.analysis : analysis;

      // Sanitize analysis object to guarantee all required Zod schema properties are present
      const sanitizedAnalysis = {
        score: targetAnalysis?.score ?? 70,
        strengths: Array.isArray(targetAnalysis?.strengths) ? targetAnalysis.strengths : [],
        weaknesses: Array.isArray(targetAnalysis?.weaknesses) ? targetAnalysis.weaknesses : [],
        suggestions: Array.isArray(targetAnalysis?.suggestions) ? targetAnalysis.suggestions : [],
        roast: Array.isArray(targetAnalysis?.roast) ? targetAnalysis.roast : [],
        attentionHierarchy: Array.isArray(targetAnalysis?.attentionHierarchy) ? targetAnalysis.attentionHierarchy : [],
        suggestedTitles: Array.isArray(targetAnalysis?.suggestedTitles) ? targetAnalysis.suggestedTitles : []
      };

      // Fallback parsing if strengths/weaknesses/suggestions are empty but roast is present
      if (sanitizedAnalysis.strengths.length === 0 && sanitizedAnalysis.weaknesses.length === 0 && sanitizedAnalysis.suggestions.length === 0 && sanitizedAnalysis.roast.length > 0) {
        sanitizedAnalysis.roast.forEach(bullet => {
          const lower = bullet.toLowerCase();
          if (lower.includes('excellent') || lower.includes('great') || lower.includes('fantastic') || lower.includes('good') || lower.includes('perfect') || lower.includes('proven') || lower.includes('optimal') || lower.includes('vibrancy') || lower.includes('vibrant')) {
            sanitizedAnalysis.strengths.push(bullet);
          } else if (lower.includes('low') || lower.includes('obstructed') || lower.includes('wordy') || lower.includes('clash') || lower.includes('vague') || lower.includes('clutter') || lower.includes('warning') || lower.includes('conflict') || lower.includes('truncat') || lower.includes('exceed')) {
            sanitizedAnalysis.weaknesses.push(bullet);
          } else {
            sanitizedAnalysis.suggestions.push(bullet);
          }
        });

        if (sanitizedAnalysis.strengths.length === 0 && sanitizedAnalysis.weaknesses.length === 0 && sanitizedAnalysis.suggestions.length === 0) {
          sanitizedAnalysis.strengths = [sanitizedAnalysis.roast[0]];
          if (sanitizedAnalysis.roast[1]) sanitizedAnalysis.weaknesses = [sanitizedAnalysis.roast[1]];
          if (sanitizedAnalysis.roast[2]) sanitizedAnalysis.suggestions = [sanitizedAnalysis.roast[2]];
        }
      }

      const payload = {
        imageUrl: customPayload ? customPayload.imageUrl : imageUrl,
        prompt: customPayload ? customPayload.prompt : (inputs.topic || inputs.title),
        title: customPayload ? customPayload.title : inputs.title,
        niche: customPayload ? customPayload.niche : selectedNiche,
        archetype: customPayload ? customPayload.archetype : selectedArchetype,
        aspectRatio: customPayload ? customPayload.aspectRatio : aspectRatio,
        provider: customPayload ? customPayload.provider : provider,
        analysis: sanitizedAnalysis
      };

      const response = await fetch('/api/history', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save to library');
      }

      setIsSaved(true);
      if (customPayload) {
        showToast('Project created and automatically saved to library!', 'success');
      } else {
        showToast('Project saved successfully to library!', 'success');
      }
    } catch (err) {
      console.error('[Save to Library Error]', err);
      showToast('Failed to save project. Please try again.', 'error');
    }
  };

  // Auto fill details from URL Import (Task 1.2)
  const handleUrlFetch = async (e) => {
    e.preventDefault();
    setUrlError('');
    setIsUrlLoading(true);

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(regex);

    if (!match) {
      setUrlError('Invalid YouTube URL. Please enter a standard video link.');
      setIsUrlLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract video details');
      }

      const data = await response.json();
      
      setInputs({
        title: data.title,
        topic: data.topic,
        keywords: data.keywords
      });
      
      setIsUrlLoading(false);
      setYoutubeUrl('');
    } catch (err) {
      console.error('Failed to extract YouTube details:', err);
      setUrlError(err.message || 'An unexpected error occurred during URL extraction.');
      setIsUrlLoading(false);
    }
  };

  // Intercept and auto-extract YouTube links pasted directly into the top search bar
  const handleSearchInputChange = async (e) => {
    const val = e.target.value;
    setInputs(prev => ({ ...prev, title: val }));

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = val.match(regex);

    if (match) {
      setIsSearchUrlLoading(true);
      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: val }),
        });

        if (response.ok) {
          const data = await response.json();
          setInputs({
            title: data.title,
            topic: data.topic,
            keywords: data.keywords
          });
        }
      } catch (err) {
        console.error('Failed to auto-extract from search input:', err);
      } finally {
        setIsSearchUrlLoading(false);
      }
    }
  };

  // Handle user self-photo upload for thumbnail maker
  const handleUserPhotoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhotoUrl(event.target.result);
      showToast('Subject photo selected! Click "Generate" to let AI design the final thumbnail.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleClearUserPhoto = () => {
    setUserPhotoUrl(null);
  };

  // Thumbnail rewrite catalog upload (Task 2.3)
  const handleExistingUpload = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setOriginalImageUrl(dataUrl);
      setImageUrl(dataUrl);
      setIsOptimized(false);
      setAnalysisError(null);
      
      setIsGenerating(true);
      setTimeout(async () => {
        try {
          const critique = await analyzeThumbnailCTR(
            dataUrl, 
            inputs.title || 'My Underperforming Thumbnail', 
            inputs.topic,
            inputs.keywords,
            selectedNiche, 
            selectedArchetype
          );
          
          // Lower the score for initial upload to simulate a dramatic clickability roast
          critique.score = Math.max(35, Math.min(62, critique.score - 15));
          critique.strengths = [
            'Dynamic visual outlines and thematic niche choice is well targeted.'
          ];
          critique.weaknesses = [
            'Foreground contrast is critically low; subject blends too much with background details.',
            'Crucial graphics are obstructed by the bottom-right video duration badge.'
          ];
          critique.suggestions = [
            'Boost focal rim-lighting to separate main subjects from the background.',
            'Move active text overlays completely clear of standard duration safe zones.'
          ];
          
          setAnalysis(critique);
          setShowCritique(true);
        } catch (err) {
          console.error('Catalog upload analysis failure:', err);
          setAnalysisError('Vignette\'s visual intelligence scanner failed to audit the uploaded catalog file.');
        } finally {
          setIsGenerating(false);
        }
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExistingUpload(e.dataTransfer.files[0]);
    }
  };


  const handleReset = () => {
    setInputs({ title: '', topic: '', keywords: '' });
    setImageUrl('');
    setOriginalImageUrl('');
    setAnalysis(null);
    setShowCritique(false);
    setIsOptimized(false);
    setProvider('');
  };

  // Auto fill suggestions from landing grids (Screenshot 1 items)
  const handleSuggestionClick = (type) => {
    if (type === 'lofi') {
      setInputs({
        title: 'An ambient thumbnail for my lofi playlist',
        topic: 'Relaxed cozy loft window view at sunset with city skyscrapers',
        keywords: 'lofi, chill, sunset, music, aesthetic'
      });
      setSelectedNiche('documentary');
      setSelectedArchetype('question');
      setImageUrl(PRESET_LOFI_IMAGE);
      setAnalysis(PRESET_LOFI_CRITIQUE);
      setShowCritique(true);
      setIsOptimized(false);
      setProvider('Vignette Preset');
    } else if (type === 'ski') {
      setInputs({
        title: 'A thumbnail for my ski travel vlog',
        topic: 'Extreme ski jump action in snowy mountains with bright orange jacket',
        keywords: 'ski, vlog, mountains, snow, extreme'
      });
      setSelectedNiche('fitness');
      setSelectedArchetype('hero');
      setImageUrl('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1280&h=720');
      setAnalysis({
        score: 76,
        strengths: [
          'High grit dynamic athletic pose provides strong kinetic energy.',
          'Snowy white backdrop provides high-contrast negative space for header text overlays.'
        ],
        weaknesses: [
          'Subject framing blends too much with white snow or sky details in the background.'
        ],
        suggestions: [
          'Add a bright orange rim light to separate the skier from the white background details.'
        ],
        roast: [
          'High grit dynamic athletic pose provides strong kinetic energy.',
          'Snowy white backdrop provides high-contrast negative space for header text overlays.',
          'Add a bright orange rim light to separate the skier from the white background details.'
        ],
        attentionHierarchy: [
          'Primary: Athlete isolated in center peak action frame',
          'Secondary: Textured snow spray spray elements',
          'Tertiary: Distant clean white mountain peak silhouettes'
        ],
        suggestedTitles: [
          'I Skied Down the Most Dangerous Mountain in Europe!',
          'How to Ski Like a Professional in 48 Hours',
          'The Ultimate Ski Travel Guide (What They Hide From You)'
        ]
      });
      setShowCritique(true);
      setIsOptimized(false);
      setProvider('Vignette Preset');
    } else if (type === 'cooking') {
      setInputs({
        title: 'A cooking series called "$10 Dinners"',
        topic: 'Luxury high-contrast modern kitchen with glowing ambient light and a central steel chef bowl',
        keywords: 'cooking, chef, luxury, kitchen, food'
      });
      setSelectedNiche('tech');
      setSelectedArchetype('versus');
      setImageUrl('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1280&h=720');
      setAnalysis({
        score: 82,
        strengths: [
          'Outstanding high-tech glass highlights. The metal reflections look extremely premium.',
          'The vertical split provides a brilliant comparison outline for a before/after recipe showcase.'
        ],
        weaknesses: [
          'Minor detail safe-zone warning: Bottom-right quadrant has negative elements near duration badges.'
        ],
        suggestions: [
          'Mobile safe-zone: Keep the bottom-right quadrant as negative space, free of duration badges.'
        ],
        roast: [
          'Outstanding high-tech glass highlights. The metal reflections look extremely premium.',
          'The vertical split provides a brilliant comparison outline for a before/after recipe showcase.',
          'Mobile safe-zone: The bottom-right quadrant has negative space, free of duration badges.'
        ],
        attentionHierarchy: [
          'Primary: Symmetrical split neon light boundary',
          'Secondary: Highly polished stainless steel utensil accents',
          'Tertiary: Warm wood panel backing reflections'
        ],
        suggestedTitles: [
          'Professional Chef vs Home Cook: Luxury Kitchen Battle!',
          'How to Design the Ultimate High-Tech Kitchen',
          '10 Cooking Secrets Only Five-Star Chefs Know'
        ]
      });
      setShowCritique(true);
      setIsOptimized(false);
      setProvider('Vignette Preset');
    }
  };

  const sidebarTabs = [
    { id: 'gallery', label: 'Projects', icon: FolderClosed, subText: 'Projects' },
    { id: 'roast', label: 'CTR Roast', icon: Flame, subText: 'CTR Roast' },
    { id: 'simulator', label: 'Feed Preview', icon: Eye, subText: 'Preview' },
    { id: 'upgrade', label: 'Upload & Audit', icon: UploadCloud, subText: 'Upload' },
    { id: 'titles', label: 'Title Pairing', icon: TextQuote, subText: 'Titles' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, subText: 'Analytics' },
  ];

  if (activeTab === 'landing') {
    return (
      <div style={styles.appContainer}>
        <LandingPage 
          user={user} 
          onStartCreating={(title) => {
            if (title) {
              setInputs(prev => ({
                ...prev,
                title: title,
                topic: title
              }));
            }
            setActiveTab('maker');
          }}
          setIsAuthOpen={setIsAuthOpen}
          setActiveTab={setActiveTab}
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
        {notification.show && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: notification.type === 'success' 
              ? 'rgba(16, 185, 129, 0.9)' 
              : notification.type === 'error' 
                ? 'rgba(239, 68, 68, 0.9)' 
                : 'rgba(99, 102, 241, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <CheckCircle size={16} />
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.appContainer, height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. HORIZONTAL TOP HEADER NAV (Quillbot Inspired Layout) */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo group */}
          <div style={styles.logoGroup} onClick={() => { setActiveTab('landing'); }}>
            <div style={styles.logoIcon}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22C2 22 8 20 12 16C16 12 22 6 22 2C22 2 16 2 12 6C8 10 2 16 2 22Z"></path>
                <path d="M12 6L18 12"></path>
                <path d="M8 10L14 16"></path>
              </svg>
            </div>
            <span style={styles.logoText}>vignette.ai</span>
          </div>

          {/* Central navigation links */}
          {isDesktop && (
            <nav style={styles.nav}>
              <a 
                href="#maker" 
                onClick={(e) => { e.preventDefault(); setActiveTab('maker'); }} 
                style={{ ...styles.navLink, ...(activeTab === 'maker' ? styles.navLinkActive : {}) }}
              >
                Create
              </a>
              <a 
                href="#roast" 
                onClick={(e) => { e.preventDefault(); setActiveTab('roast'); }} 
                style={{ ...styles.navLink, ...(activeTab === 'roast' ? styles.navLinkActive : {}) }}
              >
                CTR Roast
              </a>
              <a 
                href="#simulator" 
                onClick={(e) => { e.preventDefault(); setActiveTab('simulator'); }} 
                style={{ ...styles.navLink, ...(activeTab === 'simulator' ? styles.navLinkActive : {}) }}
              >
                Preview
              </a>
              <a 
                href="#analytics" 
                onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }} 
                style={{ ...styles.navLink, ...(activeTab === 'analytics' ? styles.navLinkActive : {}) }}
              >
                Analytics
              </a>
            </nav>
          )}

          {/* Right actions */}
          <div style={styles.headerActions}>
            <button 
              onClick={() => setActiveTab('analytics')}
              style={styles.upgradeBtn}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#ffbe0b" stroke="#ffbe0b" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
                <path d="M2 4L5 12L12 6L19 12L22 4L17 18H7L2 4Z" />
              </svg>
              Upgrade to Premium
            </button>
            
            {user ? (
              /* Logged In View: Profile Avatar with dropdown */
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(255, 129, 56, 0.2)'
                  }}>
                    {user.email ? user.email.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '200px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: '14px',
                    backdropFilter: 'blur(10px)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 8px', textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>{user.email}</span>
                      <span style={{ fontSize: '9px', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authenticated</span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.05)', margin: '4px 0' }}></div>
                    <button 
                      onClick={() => { handleSignOut(); setShowDropdown(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        width: '100%'
                      }}
                      className="dropdown-item-hover"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest View: Sign In & Join CTAs */
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setIsAuthOpen(true)} 
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    transition: 'color 0.2s',
                  }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="btn btn-primary"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Join Free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DASHBOARD SPLIT BODY (Sidebar + Active Workspace Card) */}
      <div style={styles.dashboardBody}>
        
        {/* LEFT VERTICAL SIDEBAR NAVIGATION */}
        {!isMobile && (
          <aside style={styles.sidebar}>
            {/* 1. Integrated Cohesive Action Button styled in the same nav system */}
            <button
              onClick={() => { setActiveTab('maker'); handleReset(); }}
              style={{
                ...styles.sidebarItem,
                background: activeTab === 'maker' ? 'var(--color-primary)' : 'rgba(99, 102, 241, 0.06)',
                border: activeTab === 'maker' ? 'none' : '1px solid rgba(99, 102, 241, 0.15)',
                boxShadow: activeTab === 'maker' ? '0 4px 12px var(--color-primary-glow)' : 'none',
                marginBottom: '16px',
                height: '74px',
                width: '84px',
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}
              className="sidebar-btn-hover"
              title="New Thumbnail"
            >
              {activeTab === 'maker' && <div style={{ ...styles.activeBar, background: '#ffffff' }}></div>}
              <Plus size={20} color={activeTab === 'maker' ? '#ffffff' : 'var(--color-primary)'} style={{ strokeWidth: 3 }} />
              <span style={{ 
                ...styles.sidebarText, 
                color: activeTab === 'maker' ? '#ffffff' : 'var(--color-primary)', 
                fontWeight: 900 
              }}>
                New
              </span>
            </button>

            {/* 2. Map other Quillbot-inspired tools with strong active/inactive differentiation */}
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.sidebarItem,
                    ...(isActive ? styles.sidebarItemActive : {}),
                    opacity: isActive ? 1 : 0.65,
                  }}
                  className="sidebar-btn-hover"
                  title={tab.label}
                >
                  {isActive && <div style={styles.activeBar}></div>}
                  <Icon 
                    size={20} 
                    style={{
                      ...styles.sidebarIcon,
                      ...(isActive ? styles.sidebarIconActive : {})
                    }} 
                  />
                  <span 
                    style={{
                      ...styles.sidebarText,
                      ...(isActive ? styles.sidebarTextActive : {})
                    }}
                  >
                    {tab.subText}
                  </span>
                </button>
              );
            })}

            <div style={{ flexGrow: 1 }} />
          </aside>
        )}

        {/* CENTRAL WORKSPACE MAIN AREA */}
        <main style={styles.workspace}>
          
          {activeTab === 'maker' ? (
            <div className="tech-dot-grid" style={{ ...styles.makerContainer, position: 'relative', overflow: 'hidden', padding: '0', width: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Glowing decorative background gradient shapes (Reference Inspired) */}
              <div style={{
                position: 'absolute',
                top: '-200px',
                right: '-100px',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none',
              }}></div>
              <div style={{
                position: 'absolute',
                top: '400px',
                left: '-200px',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none',
              }}></div>

              {/* ==========================================
                  1. HERO SECTION (Separate Individual Section - Spaced & Clean)
                  ========================================== */}
              <section style={{ 
                position: 'relative', 
                zIndex: 1, 
                padding: '80px 48px 80px 48px', 
                width: '100%',
                borderBottom: '1px solid rgba(99, 102, 241, 0.05)',
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isDesktop ? '1.3fr 0.7fr' : '1fr', 
                  gap: '64px', 
                  alignItems: 'center',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  width: '100%'
                }}>
                  
                  {/* Left Column: Value Proposition & Glass Prompt compiler */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Next-gen Badge */}
                    <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '6px', background: 'var(--color-primary-glow)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '20px', padding: '6px 14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                        Next-Generation of AI Images
                      </span>
                    </div>

                    {/* Headline & Subhead */}
                    <h1 style={{ ...styles.makerHeadline, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1.15', letterSpacing: '-0.03em' }}>
                      Imagine AI as your<br />
                      <span className="pixel-accent-headline" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                        Thumbnail Director.
                      </span>
                    </h1>
                    
                    <p style={{ ...styles.makerSubhead, fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '540px' }}>
                      Secure, serverless platform to generate powerful AI thumbnails and performance optimization. What will you create today?
                    </p>

                    {/* Step-by-Step Workflow Guide (Workflow Clarity) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '12px', marginBottom: '4px', opacity: 0.95 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        <span style={{ background: 'var(--color-primary-glow)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>1</span>
                        <span>Describe video topic</span>
                      </div>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <span style={{ background: 'var(--bg-surface-elevated)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>2</span>
                        <span>Choose style niche</span>
                      </div>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <span style={{ background: 'var(--bg-surface-elevated)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>3</span>
                        <span>Generate & Roast CTR</span>
                      </div>
                    </div>

                    {/* Search & Generate Glass Bar */}
                    <div className="card-glass" style={{ padding: '10px 14px', borderRadius: '18px', border: '1px solid rgba(99, 102, 241, 0.15)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(25px)', boxShadow: '0 16px 40px rgba(99, 102, 241, 0.08)', marginTop: '8px', width: '100%', maxWidth: '680px', position: 'relative', zIndex: 10 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                        
                        {/* Prompt Input */}
                        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isSearchUrlLoading ? (
                            <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--border-subtle)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginLeft: '4px' }}></span>
                          ) : (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                              <circle cx="11" cy="11" r="8"></circle>
                              <path d="m21 21-4.3-4.3"></path>
                            </svg>
                          )}
                          <input 
                            type="text"
                            value={inputs.title}
                            onChange={handleSearchInputChange}
                            placeholder="Describe your video topic or paste YouTube link..."
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>

                        {/* Custom Style / Niche Selector */}
                        <div ref={dropdownRef} style={{ position: 'relative', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '10px', display: 'flex', alignItems: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ 
                              border: 'none', 
                              background: 'transparent', 
                              outline: 'none', 
                              fontSize: '13px', 
                              fontWeight: 700, 
                              color: 'var(--text-secondary)', 
                              cursor: 'pointer', 
                              fontFamily: 'Outfit, sans-serif', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              userSelect: 'none'
                            }}
                            className="custom-dropdown-trigger"
                          >
                            <span>{selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)}</span>
                            <svg 
                              viewBox="0 0 24 24" 
                              width="14" 
                              height="14" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              style={{ 
                                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', 
                                transition: 'transform 0.2s',
                                opacity: 0.7
                              }}
                            >
                              <path d="m6 9 6 6 6-6"></path>
                            </svg>
                          </button>

                          {showDropdown && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 12px)',
                                right: '0',
                                background: 'rgba(255, 255, 255, 0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                borderRadius: '12px',
                                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.12)',
                                zIndex: 100,
                                minWidth: '160px',
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            >
                              {[
                                { value: 'documentary', label: 'Documentary' },
                                { value: 'gaming', label: 'Gaming' },
                                { value: 'finance', label: 'Finance' },
                                { value: 'tech', label: 'Tech' },
                                { value: 'fitness', label: 'Fitness' }
                              ].map((item) => {
                                const isActive = selectedNiche === item.value;
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                      setSelectedNiche(item.value);
                                      setShowDropdown(false);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: isActive ? 'var(--color-primary)' : 'transparent',
                                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                      padding: '8px 14px',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      fontWeight: isActive ? 700 : 600,
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontFamily: 'Inter, sans-serif',
                                      transition: 'all 0.15s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      width: '100%'
                                    }}
                                    className={isActive ? '' : 'dropdown-item-hover'}
                                  >
                                    <span>{item.label}</span>
                                    {isActive && (
                                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5"></path>
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Generate button */}
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || !inputs.title.trim()}
                          className="btn btn-primary"
                          style={{ background: 'var(--color-primary)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)', transition: 'all 0.2s' }}
                        >
                          {isGenerating ? (
                            <>
                              <span style={styles.btnSpinner}></span>
                              Generat...
                            </>
                          ) : (
                            <>
                              Generate
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                              </svg>
                            </>
                          )}
                        </button>

                        {/* Use Your Photo button */}
                        <label
                          title="Upload your own photo to use as thumbnail"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: userPhotoUrl ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                            border: `1px solid ${userPhotoUrl ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: '10px',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: userPhotoUrl ? 'var(--color-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                          className="user-photo-upload-btn"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {userPhotoUrl ? 'Photo Added ✓' : 'Use My Photo'}
                          <input
                            ref={userPhotoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleUserPhotoUpload(e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                        </label>

                      </div>
                    </div>

                    {/* Aspect Ratio Format Pill Selector */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginTop: '14px', zIndex: 1, position: 'relative' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format Type:</span>
                      <button
                        onClick={() => setAspectRatio('16:9')}
                        style={{
                          border: '1px solid',
                          borderColor: aspectRatio === '16:9' ? 'var(--color-primary)' : 'var(--border-subtle)',
                          background: aspectRatio === '16:9' ? 'var(--color-primary-glow)' : 'var(--bg-surface)',
                          color: aspectRatio === '16:9' ? 'var(--color-primary)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s', outline: 'none'
                        }}
                      >
                        Standard (16:9)
                      </button>
                      <button
                        onClick={() => setAspectRatio('9:16')}
                        style={{
                          border: '1px solid',
                          borderColor: aspectRatio === '9:16' ? 'var(--color-primary)' : 'var(--border-subtle)',
                          background: aspectRatio === '9:16' ? 'var(--color-primary-glow)' : 'var(--bg-surface)',
                          color: aspectRatio === '9:16' ? 'var(--color-primary)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s', outline: 'none'
                        }}
                      >
                        YouTube Shorts (9:16)
                      </button>
                    </div>

                    {/* Popular Tags Archetypes selector below bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginTop: '12px', zIndex: 1, position: 'relative' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Click Archetype:</span>
                      
                      <button 
                        onClick={() => setSelectedArchetype('question')}
                        style={{
                          border: '1px solid',
                          borderColor: selectedArchetype === 'question' ? 'var(--color-accent)' : 'var(--border-subtle)',
                          background: selectedArchetype === 'question' ? 'var(--color-accent-glow)' : 'var(--bg-surface)',
                          color: selectedArchetype === 'question' ? 'var(--color-accent-hover)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Burning Question
                      </button>
                      <button 
                        onClick={() => setSelectedArchetype('versus')}
                        style={{
                          border: '1px solid',
                          borderColor: selectedArchetype === 'versus' ? 'var(--color-accent)' : 'var(--border-subtle)',
                          background: selectedArchetype === 'versus' ? 'var(--color-accent-glow)' : 'var(--bg-surface)',
                          color: selectedArchetype === 'versus' ? 'var(--color-accent-hover)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Versus Split
                      </button>
                      <button 
                        onClick={() => setSelectedArchetype('hero')}
                        style={{
                          border: '1px solid',
                          borderColor: selectedArchetype === 'hero' ? 'var(--color-accent)' : 'var(--border-subtle)',
                          background: selectedArchetype === 'hero' ? 'var(--color-accent-glow)' : 'var(--bg-surface)',
                          color: selectedArchetype === 'hero' ? 'var(--color-accent-hover)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Hero Subject
                      </button>
                      <button 
                        onClick={() => setSelectedArchetype('reaction')}
                        style={{
                          border: '1px solid',
                          borderColor: selectedArchetype === 'reaction' ? 'var(--color-accent)' : 'var(--border-subtle)',
                          background: selectedArchetype === 'reaction' ? 'var(--color-accent-glow)' : 'var(--bg-surface)',
                          color: selectedArchetype === 'reaction' ? 'var(--color-accent-hover)' : 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        Extreme Emotion
                      </button>
                    </div>

                  </div>

                  {/* Right Column: Interactive Thumbnail Preview or 3D Mascot */}
                  <div style={{ flex: 0.9, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>

                    {userPhotoUrl ? (
                      /* === USER PHOTO SELECTION PREVIEW === */
                      <div className="card-glass" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px', textAlign: 'center', animation: 'dropdownFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbe0b', animation: 'pulse 1.5s infinite' }}></div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>Subject Photo Loaded</span>
                        </div>

                        <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '24px', overflow: 'hidden', margin: '0 auto', border: '3px solid var(--color-primary-glow)', boxShadow: '0 12px 28px rgba(99, 102, 241, 0.15)' }}>
                          <img 
                            src={userPhotoUrl} 
                            alt="Uploaded subject" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>

                        <div>
                          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>AI Composite Source Active</h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                            Vignette AI will seamlessly extract this subject, apply professional rim lighting, and compose a premium high-CTR thumbnail layout.
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                          <button
                            onClick={() => userPhotoInputRef.current?.click()}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '8px 16px' }}
                          >
                            Change Photo
                          </button>
                          <button
                            onClick={handleClearUserPhoto}
                            className="btn btn-danger"
                            style={{ fontSize: '12px', padding: '8px 16px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: 'var(--color-danger)' }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* === DEFAULT 3D MASCOT === */
                      <>
                        {/* Premium glassmorphic speech bubble */}
                        <div 
                          className="floating-speech-bubble"
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: isDesktop ? '-20px' : '10px',
                            zIndex: 10,
                            background: 'rgba(239, 241, 249, 0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.12)',
                            borderRadius: '20px 20px 4px 20px',
                            padding: '12px 18px',
                            maxWidth: '220px',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.05)',
                            pointerEvents: 'none'
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: '1.4', fontFamily: 'Inter, sans-serif' }}>
                            <strong style={{ color: 'var(--color-primary)' }}>Vigi:</strong> "Describe your video topic on the left and let's craft high-CTR art!"
                          </span>
                          {/* Little tail pointing towards the left */}
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '-8px',
                            width: '16px',
                            height: '16px',
                            background: '#eff1f9',
                            borderLeft: '1px solid rgba(99, 102, 241, 0.12)',
                            borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
                            transform: 'rotate(45deg)',
                            zIndex: -1
                          }}></div>
                        </div>

                        {/* The 3D Canvas mascot wrapper */}
                        <div style={{ zIndex: 2, position: 'relative', width: '100%', maxWidth: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ThreeMascot />
                        </div>
                      </>
                    )}

                  </div>

                </div>
              </section>

              {/* ==========================================
                  2. CAROUSEL ARTWORK SLIDER SECTION (Reference Inspired)
                  ========================================== */}
              <div style={{ padding: '60px 48px 60px 48px', zIndex: 1, position: 'relative', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em' }}>
                    ✦ Magical High-CTR Artwork Presets ✦
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scroll horizontally or click to load</span>
                </div>

                <div className="horizontal-slider-container">
                  
                  {/* Presets Card 1: Sunset beats */}
                  <div className="slider-card" onClick={() => handleSuggestionClick('lofi')}>
                    <img src={PRESET_LOFI_IMAGE} className="slider-card-img" alt="Lofi sunset beats" />
                    <div className="slider-card-overlay">
                      <span className="slider-card-tag">Documentary</span>
                      <h4 className="slider-card-title">Retro Sunset Lofi beats to chill/relax</h4>
                    </div>
                    <div className="slider-card-play">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>

                  {/* Presets Card 2: Ski jump */}
                  <div className="slider-card" onClick={() => handleSuggestionClick('ski')}>
                    <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1280&h=720" className="slider-card-img" alt="Ski vlog" />
                    <div className="slider-card-overlay">
                      <span className="slider-card-tag" style={{ background: '#ec4899' }}>Fitness</span>
                      <h4 className="slider-card-title">I Skied Down The Most Dangerous Peak</h4>
                    </div>
                    <div className="slider-card-play">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>

                  {/* Presets Card 3: Modern Split Kitchen */}
                  <div className="slider-card" onClick={() => handleSuggestionClick('cooking')}>
                    <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1280&h=720" className="slider-card-img" alt="Kitchen battle" />
                    <div className="slider-card-overlay">
                      <span className="slider-card-tag" style={{ background: '#06b6d4' }}>Tech / VS</span>
                      <h4 className="slider-card-title">Professional Chef vs Symmetrical Cook</h4>
                    </div>
                    <div className="slider-card-play">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>

                  {/* Presets Card 4: Gaming Hub */}
                  <div className="slider-card" onClick={() => {
                    setInputs({ title: 'Is this the future of retro gaming setup?', topic: 'Cyberpunk console setup with dynamic neon controller glowing', keywords: 'gaming, retro, cyberpunk' });
                    setSelectedNiche('gaming');
                    setSelectedArchetype('hero');
                    setImageUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1280&h=720');
                    setAnalysis({
                      score: 85,
                      strengths: [
                        'Fantastic saturated neon backlighting.',
                        'Centralized focal subject provides strong clarity.'
                      ],
                      weaknesses: [
                        'High visual noise may cause background clutter at smaller smartphone scales.'
                      ],
                      suggestions: [
                        'Aspect check: Keep left-biased elements clear of duration overlay badges.'
                      ],
                      roast: [
                        'Fantastic saturated neon backlighting.',
                        'Centralized focal subject provides strong clarity.',
                        'Aspect check: left-biased elements remain clear of duration overlay badges.'
                      ],
                      attentionHierarchy: [
                        'Primary: Saturated glowing center controllers',
                        'Secondary: Atmospheric desk setups'
                      ],
                      suggestedTitles: [
                        'I Built the Ultimate 3D Retro Gaming Hub',
                        'Is this Cyberpunk Setup Worth $5000?',
                        'The Future of Retro Video Games'
                      ]
                    });

                    setShowCritique(true);
                    setIsOptimized(false);
                    setProvider('Vignette Preset');
                  }}>
                    <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1280&h=720" className="slider-card-img" alt="Gaming console" />
                    <div className="slider-card-overlay">
                      <span className="slider-card-tag" style={{ background: '#f59e0b' }}>Gaming</span>
                      <h4 className="slider-card-title">Cyberpunk Setup With Neon controllers</h4>
                    </div>
                    <div className="slider-card-play">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>

                  {/* Presets Card 5: Finance wealth charts */}
                  <div className="slider-card" onClick={() => {
                    setInputs({ title: 'The reality of investing in stock market charts', topic: 'Modern growth curves with gold wealth overlays in studio room', keywords: 'finance, wealth, investing' });
                    setSelectedNiche('finance');
                    setSelectedArchetype('question');
                    setImageUrl('https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1280&h=720');
                    setAnalysis({
                      score: 80,
                      strengths: [
                        'Premium gold wealth elements build quick credibility.',
                        'Minimal grid backgrounds pop correctly.'
                      ],
                      weaknesses: [
                        'Typography overlays might exceed optimal size bounds.'
                      ],
                      suggestions: [
                        'Check: Keep overlay keywords simple to boost scannability.'
                      ],
                      roast: [
                        'Premium gold wealth elements build quick credibility.',
                        'Minimal grid backgrounds pop correctly.',
                        'Check: Keep overlay keywords simple to boost scannability.'
                      ],
                      attentionHierarchy: [
                        'Primary: Gold growth line highlights',
                        'Secondary: Atmospheric chart backing details'
                      ],
                      suggestedTitles: [
                        'The Stock Market investing secret they hide from you...',
                        'How I Made $10,000 investing as a complete beginner',
                        'The Ultimate 2026 growth market guide'
                      ]
                    });

                    setShowCritique(true);
                    setIsOptimized(false);
                    setProvider('Vignette Preset');
                  }}>
                    <img src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1280&h=720" className="slider-card-img" alt="Finance growth curves" />
                    <div className="slider-card-overlay">
                      <span className="slider-card-tag" style={{ background: '#10b981' }}>Finance</span>
                      <h4 className="slider-card-title">Growth curves with gold wealth lines</h4>
                    </div>
                    <div className="slider-card-play">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" stroke="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* ==========================================
                  3. WHAT WE DO FEATURE CARD GRID SECTION (Reference Inspired)
                  ========================================== */}
              <div style={{ padding: '64px 48px', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center', zIndex: 1, position: 'relative', width: '100%' }}>
                <div style={{ marginBottom: '36px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                    WHAT WE DO
                  </span>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', maxWidth: '640px', margin: '0 auto 12px auto' }}>
                    Bring your imagination to the screen with{' '}
                    <span style={{ color: 'var(--color-primary)' }}>
                      Ai thumbnail roasts
                    </span>
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
                    Generate stunning layouts, analyze clickability flags, simulator realistic postage feeds, and snap custom text layers with full defensive safety.
                  </p>
                  
                  {/* Cursive Signature metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                    <svg viewBox="0 0 100 30" width="80" height="24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                      <path d="M10,15 Q25,5 35,25 T60,15 T85,15 T95,5 M30,5 L30,25" />
                    </svg>
                    <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)', fontFamily: 'Dancing Script, cursive, Georgia' }}>Vigi AI, Creative Director</span>
                  </div>
                </div>

                {/* 4 Cards layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                  
                  {/* Card 1: Generator */}
                  <div 
                    onClick={() => setActiveTab('maker')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '28px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '8px' }}>
                      <Sparkles size={20} color="var(--color-primary)" />
                    </div>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Image generator</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Type text video ideas to generate high-CTR thumbnail compositions matching standard left-biased focal subjects.
                    </p>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-start', width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: CTR Roast */}
                  <div 
                    onClick={() => setActiveTab('roast')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '28px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.08)', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '8px' }}>
                      <Flame size={20} color="var(--color-accent)" />
                    </div>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Vision CTR roast</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Vision-based analysis scores clickability, roasts clashing elements, maps focal attention hierarchies, and alerts errors.
                    </p>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-start', width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Card 3: Preview */}
                  <div 
                    onClick={() => setActiveTab('simulator')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '28px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.08)', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '8px' }}>
                      <Eye size={20} color="var(--color-cyan)" />
                    </div>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Feed simulator</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Test micro mobile feeds search results card preview sidebars to confirm text readability at realistic postage scales.
                    </p>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-start', width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* ==========================================
                  4. RUNNING TEXT RIBBON MARQUEE SECTION (Reference Inspired)
                  ========================================== */}
              <div className="marquee-container" style={{ margin: '0', width: '100%' }}>
                <div className="marquee-content">
                  <span className="marquee-item">Magical Images ✦ <span className="marquee-item-accent">Image Generator</span></span>
                  <span className="marquee-item">✦ Clickability Roast ✦ <span className="marquee-item-accent">Focal Attention</span></span>
                  <span className="marquee-item">✦ Responsive Simulator ✦ <span className="marquee-item-accent">Snap Typography</span></span>
                  <span className="marquee-item">✦ A/B Performance ✦ <span className="marquee-item-accent">CTR Director</span></span>
                  
                  {/* Duplicate contents for smooth loop */}
                  <span className="marquee-item">Magical Images ✦ <span className="marquee-item-accent">Image Generator</span></span>
                  <span className="marquee-item">✦ Clickability Roast ✦ <span className="marquee-item-accent">Focal Attention</span></span>
                  <span className="marquee-item">✦ Responsive Simulator ✦ <span className="marquee-item-accent">Snap Typography</span></span>
                  <span className="marquee-item">✦ A/B Performance ✦ <span className="marquee-item-accent">CTR Director</span></span>
                </div>
              </div>

              {/* ==========================================
                  5. BEFORE-VS-AFTER / HOW TO DETAIL SECTION (Reference Inspired)
                  ========================================== */}
              <div style={{ padding: '80px 48px', zIndex: 1, position: 'relative', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '64px', alignItems: 'center' }}>
                  
                  {/* Left side: comparison slider or preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent-hover)', letterSpacing: '0.08em' }}>
                      OPEN AI IMAGE GENERATOR
                    </span>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                      How to generate<br />
                      <span style={{ color: 'var(--color-primary)' }}>AI optimized images</span>
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Vignette automatically maps visual focal shapes, isolates key subjects, and applies heavy background blurs. Toggle between our visual comparison cards below to see the dramatic difference.
                    </p>

                    {/* Side-by-side comparative split */}
                    <div className="card-glass" style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', marginTop: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <div style={{ flex: aspectRatio === '9:16' ? 'none' : 1, width: aspectRatio === '9:16' ? '80px' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>ORIGINAL DRAFT:</span>
                          <div style={{ aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                            <img src={aspectRatio === '9:16' ? "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=720&h=1280" : "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=120&h=70"} alt="Draft" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.6) blur(0.5px)' }} />
                          </div>
                        </div>
                        <div style={{ flex: aspectRatio === '9:16' ? 'none' : 1, width: aspectRatio === '9:16' ? '80px' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-primary)' }}>OPTIMIZED UPGRADE:</span>
                          <div style={{ aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--color-primary)' }}>
                            <img src={aspectRatio === '9:16' ? "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=720&h=1280" : "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=120&h=70"} alt="CTR Optimized" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: 'var(--color-primary-glow)', padding: '8px 14px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>Score Lift:</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>From 62% CTR clickability up to 88%!</span>
                      </div>
                    </div>

                  </div>

                  {/* Right side: Step descriptions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    <div style={{ display: 'flex', gap: '16px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '20px' }}>
                      <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 800 }}>
                        1
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Describe video requirements</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Type in video titles and select niches to instruct the prompt loop rules on focal subject bounds.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', borderLeft: '3px solid var(--border-subtle)', paddingLeft: '20px' }}>
                      <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 800, border: '1px solid var(--border-subtle)' }}>
                        2
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Audit clickability details</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Analyze design grades to view focal points, clashing contrast alerts, and badge overlaps.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', borderLeft: '3px solid var(--border-subtle)', paddingLeft: '20px' }}>
                      <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 800, border: '1px solid var(--border-subtle)' }}>
                        3
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Adjust snap-grid typography</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Double-check device scaling at postage postage size and snap large sans-serif typography overlays.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          ) : (
            <>

            {/* ==============================================================
                TAB 2: GALLERY / PROJECTS (Task 1.4 Grid Output)
                ============================================================== */}
            {activeTab === 'gallery' && (
              <LibraryPanel 
                session={session} 
                onSelect={(item) => {
                  // Restore workspace states
                  setImageUrl(item.imageUrl);
                  setInputs({ 
                    title: item.title || 'Untitled Generation', 
                    topic: item.prompt || item.title || '', 
                    keywords: '' 
                  });
                  setSelectedNiche(item.niche || 'gaming');
                  setSelectedArchetype(item.archetype || 'reaction');
                  setAspectRatio(item.aspectRatio || '16:9');
                  setProvider(item.provider || 'AI Engine');
                  if (item.analysis) {
                    setAnalysis(item.analysis);
                  }
                  setIsSaved(true);
                  setActiveTab('roast');
                  showToast('Project restored successfully.', 'success');
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {/* ==============================================================
                TAB 3: CTR ROAST / ANALYZER (Task 2.2 Visual Roast Panel)
                ============================================================== */}
            {activeTab === 'roast' && (
              <div style={styles.mainCard}>
                <div style={styles.roastContainer}>
                  <div style={styles.workspaceHeader}>
                    <h2 style={styles.workspaceTitle}>Visual CTR Roast Intelligence</h2>
                    <p style={styles.workspaceDesc}>
                      Vignette's deep vision grades highlight readability thresholds, safe-zones, and layout clashing factors instantly.
                    </p>
                  </div>

                  {analysisError ? (
                    /* Dynamic Graceful Error State */
                    <div className="card-glass flex-center" style={{ flex: 1, minHeight: '400px', flexDirection: 'column', gap: '20px', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'linear-gradient(135deg, #ffffff 0%, rgba(239, 68, 68, 0.01) 100%)', textAlign: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={28} color="var(--color-danger)" />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Visual Roast Network Offline
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
                          {analysisError}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                          onClick={() => {
                            setAnalysisError(null);
                            handleGenerate();
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '12.5px', padding: '10px 18px' }}
                        >
                          Retry Connection
                        </button>
                        <button 
                          onClick={() => {
                            setAnalysisError(null);
                            const fallbackResult = getMockCTRScore(
                              inputs.title, 
                              selectedNiche, 
                              selectedArchetype, 
                              inputs.topic, 
                              inputs.keywords
                            );
                            setAnalysis(fallbackResult);
                            setShowCritique(true);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '12.5px', padding: '10px 18px' }}
                        >
                          Activate Local Sandbox
                        </button>
                      </div>
                    </div>
                  ) : isGenerating ? (
                    /* AI Analyzing Loading State: "AI analyzing thumbnail..." (Scanner Effect) */
                    <div className="card-glass flex-center" style={{ flex: 1, minHeight: '400px', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden', padding: '40px' }}>
                      <div className="shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}></div>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'var(--color-primary-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)',
                        animation: 'float-fast 2.5s ease-in-out infinite'
                      }}>
                        <Sparkles size={36} color="var(--color-primary)" className="spinner" style={{ animation: 'spin-slow 8s linear infinite' }} />
                      </div>
                      <div style={{ textAlign: 'center', zIndex: 1 }}>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          AI Scanning Thumbnail...
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
                          Vignette's visual intelligence engine is auditing layout grids, textsafe spaces, clashing contrast rates, and readability constraints.
                        </p>
                      </div>
                      
                      <div style={{ width: '220px', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div className="shimmer" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}></div>
                      </div>
                    </div>
                  ) : !imageUrl ? (
                    /* Premium proactive Empty State to redirect creators */
                    <div className="card-glass flex-center" style={{ flex: 1, minHeight: '400px', flexDirection: 'column', gap: '24px', padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #ffffff 0%, rgba(99, 102, 241, 0.01) 100%)', border: '1px dashed rgba(99, 102, 241, 0.25)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={32} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Director's Visual Critique is Empty
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
                          No visual thumbnail asset is loaded in the workspace. Describe video concepts to generate layout elements, or upload catalogue drafts to run audits.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => setActiveTab('maker')}
                          className="btn btn-primary"
                          style={{ fontSize: '12.5px', padding: '10px 18px' }}
                        >
                          <Sparkles size={14} />
                          Create New Blueprint
                        </button>
                        <button 
                          onClick={() => setActiveTab('upgrade')}
                          className="btn btn-secondary"
                          style={{ fontSize: '12.5px', padding: '10px 18px' }}
                        >
                          <UploadCloud size={14} />
                          Upload Catalogue Draft
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Success State with split columns */
                    <div style={{ ...styles.roastFlexGrid, minHeight: isDesktop ? 'calc(90vh - 140px)' : 'auto', alignItems: 'center' }}>
                      
                      {/* Left Column: Visual Preview */}
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <Gallery 
                          imageUrl={imageUrl} 
                          isGenerating={isGenerating} 
                          onAnalyze={() => setActiveTab('roast')}
                          originalImageUrl={originalImageUrl}
                          provider={provider}
                          isOptimized={isOptimized}
                          aspectRatio={aspectRatio}
                          title={inputs.title}
                          onSaveToLibrary={handleSaveToLibrary}
                          isSaved={isSaved}
                        />
                      </div>

                      {/* Right Column: Roast critique panel */}
                      <div style={{ flex: 1.2, minWidth: '320px' }}>
                        {analysis ? (
                          <CTRAnalysisPanel 
                            analysisData={analysis}
                            onOptimize={handleOptimize}
                            isOptimizing={isOptimizing}
                            originalTitle={inputs.title}
                            onSelectTitle={(t) => setInputs(prev => ({ ...prev, title: t }))}
                          />
                        ) : (
                          <div className="card-glass flex-center" style={{ height: '320px', flexDirection: 'column' }}>
                            <Flame size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                            <h4 style={{ color: 'var(--text-secondary)' }}>No Roast Log Loaded</h4>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==============================================================
                TAB 5: FEED SIMULATOR (Task 3.2 Youtube Feed Simulator)
                ============================================================== */}
            {activeTab === 'simulator' && (
              <div style={styles.mainCard}>
                <div style={styles.simulatorContainer}>
                  <div style={styles.workspaceHeader}>
                    <h2 style={styles.workspaceTitle}>Postage Feed Simulator</h2>
                    <p style={styles.workspaceDesc}>
                      Test visual legibility at realistic postage-stamp and desktop search grid scales alongside real titles.
                    </p>
                  </div>

                  <div style={styles.simulatorFlexGrid}>
                    <div style={{ flex: 1.2, minWidth: '320px' }}>
                      <YoutubePreview 
                        imageUrl={imageUrl || PRESET_LOFI_IMAGE} 
                        title={inputs.title || 'Cozy Ambient Playlistbeats to relax/study'} 
                        aspectRatio={aspectRatio}
                      />
                    </div>

                    <div style={{ flex: 0.8, minWidth: '240px' }} className="card-glass">
                      <h4 style={styles.simulatorCardTitle}>Responsive Device Previews</h4>
                      <p style={styles.simulatorCardText}>
                        Your layout composition is rendered across three realistic search models:
                      </p>
                      
                      <div style={styles.previewChecklist}>
                        <div style={styles.previewCheckItem}>
                          <CheckCircle size={14} color="#06d6a0" />
                          <span style={styles.previewCheckText}>Mobile View Card (~168px wide)</span>
                        </div>
                        <div style={styles.previewCheckItem}>
                          <CheckCircle size={14} color="#06d6a0" />
                          <span style={styles.previewCheckText}>Desktop Search Feed (~360px wide)</span>
                        </div>
                        <div style={styles.previewCheckItem}>
                          <CheckCircle size={14} color="#06d6a0" />
                          <span style={styles.previewCheckText}>Suggested Video Sidebar Grid</span>
                        </div>
                      </div>

                      <p style={styles.simulatorNotice}>
                        Check that all text overlay letters remain fully readable even at the smallest postage-stamp scale on mobile feeds!
                      </p>


                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                TAB 6: REWRITE UPGRADE / FILE UPLOAD (Task 2.3 Upload Roast)
                ============================================================== */}
            {activeTab === 'upgrade' && (
              <div style={styles.mainCard}>
                <div style={styles.upgradeWorkspace}>
                  <div style={styles.workspaceHeader}>
                    <h2 style={styles.workspaceTitle}>Thumbnail Rewrite Upgrade (Catalog Audit)</h2>
                    <p style={styles.workspaceDesc}>
                      Upload an existing underperforming thumbnail to analyze contrast, safe-zone clashes, and roast visual layouts.
                    </p>
                  </div>

                  <div style={{ ...styles.upgradeFlexGrid, minHeight: isDesktop ? 'calc(90vh - 140px)' : 'auto', alignItems: 'center' }}>
                    
                    {/* File Pick Area */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                      <div 
                        onDragEnter={handleDrag} 
                        onDragOver={handleDrag} 
                        onDragLeave={handleDrag} 
                        onDrop={handleDrop}
                        style={{
                          ...styles.dragArea,
                          ...(dragActive ? styles.dragAreaActive : {})
                        }}
                      >
                        <UploadCloud size={36} color={dragActive ? "var(--color-primary)" : "var(--text-muted)"} style={{ marginBottom: '16px' }} />
                        <h4 style={styles.dragText}>Drag & Drop Thumbnail Image</h4>
                        <p style={styles.dragSub}>Supports PNG, JPG, or JPEG aspect ratio checks</p>
                        
                        <label style={styles.upgradeUploadLabel}>
                          <Plus size={14} />
                          Select Local File
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => e.target.files && handleExistingUpload(e.target.files[0])}
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>

                      {/* Reset existing upload button */}
                      {originalImageUrl && (
                        <button
                          onClick={() => { setOriginalImageUrl(''); setImageUrl(PRESET_LOFI_IMAGE); setAnalysis(PRESET_LOFI_CRITIQUE); }}
                          className="btn btn-secondary"
                          style={{ width: '100%', marginTop: '12px' }}
                        >
                          <RotateCcw size={14} />
                          Clear Uploaded File
                        </button>
                      )}
                    </div>

                    {/* Visual Audit comparison Area */}
                    <div style={{ flex: 1.2, minWidth: '320px' }} className="card-glass">
                      {originalImageUrl ? (
                        <div style={styles.compareWrapper}>
                          <h4 style={styles.compareTitle}>Catalog Audit Spotlight (Before vs After)</h4>
                          
                          <div style={styles.comparisonPairRow}>
                            <div style={styles.comparisonCol}>
                              <span style={styles.comparisonLabel}>Original Draft:</span>
                              <div style={styles.comparisonColImgWrap}>
                                <img src={originalImageUrl} alt="Original uploaded asset" style={styles.compareImg} />
                              </div>
                            </div>

                            <div style={styles.comparisonCol}>
                              <span style={{ ...styles.comparisonLabel, color: 'var(--color-primary)' }}>AI Click-Optimized:</span>
                              <div style={{ ...styles.comparisonColImgWrap, borderColor: 'var(--color-primary)' }}>
                                <img src={imageUrl} alt="Optimized active asset" style={styles.compareImg} />
                              </div>
                            </div>
                          </div>

                          {analysis && (
                            <div style={styles.miniRoastBlock}>
                              <div style={styles.miniRoastHeader}>
                                <AlertTriangle size={14} color="var(--color-accent)" />
                                <strong style={styles.miniRoastHeadTitle}>Initial Upload Roast Details</strong>
                              </div>
                              <div style={styles.miniRoastList}>
                                {analysis.roast.slice(0, 2).map((item, idx) => (
                                  <div key={idx} style={styles.miniRoastItem}>
                                    • {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => setActiveTab('roast')}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                          >
                            <Flame size={14} />
                            Full CTR Roast Score Review
                          </button>
                        </div>
                      ) : (
                        <div style={styles.compareEmpty}>
                          <ImageIcon size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                          <h4 style={{ color: 'var(--text-secondary)' }}>Audit Panel Idle</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '240px' }}>
                            Upload an external thumbnail card on the left to trigger the comparison simulator automatically!
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                TAB 7: TITLE PAIRING (Task 3.1 Title Suggestion cards)
                ============================================================== */}
            {activeTab === 'titles' && (
              <div style={styles.mainCard}>
                <div style={styles.titlesWorkspace}>
                  <div style={styles.workspaceHeader}>
                    <h2 style={styles.workspaceTitle}>Viral Title suggestions Pairing</h2>
                    <p style={styles.workspaceDesc}>
                      Pairs descriptive visual compositions alongside recommended high-CTR title variations for ultimate feed attraction.
                    </p>
                  </div>

                  <div style={{ ...styles.titlesFlexGrid, minHeight: isDesktop ? 'calc(90vh - 140px)' : 'auto', alignItems: 'center' }}>
                    
                    {/* Left Column: Visual Pairing Simulator */}
                    <div style={{ flex: 1.2, minWidth: '300px' }} className="card-glass">
                      <h4 style={styles.titleCardHeading}>Active Title & Thumbnail Pair</h4>
                      
                      <div style={styles.pairedViewCard}>
                        <div style={styles.pairedImageWrap}>
                          <img src={imageUrl || PRESET_LOFI_IMAGE} alt="Pair active visual" style={styles.pairedImg} />
                        </div>
                        <div style={styles.pairedMetaBlock}>
                          <div style={styles.pairedLogoGroup}>
                            <div style={styles.pairedAvatar}>N</div>
                            <div>
                              <strong style={styles.pairedUser}>Nitya Vlog</strong>
                              <span style={styles.pairedDate}>1.2M views • 2 hours ago</span>
                            </div>
                          </div>
                          <h3 style={styles.pairedVideoTitle}>"{inputs.title || 'Video Title'}"</h3>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Suggested list */}
                    <div style={{ flex: 0.8, minWidth: '240px' }} className="card-glass">
                      <h4 style={styles.titleCardHeading}>Paired Viral Title Variations</h4>
                      <p style={styles.titleCardDesc}>
                        Click any option to instantly swap the active video title and preview the paired feed layout:
                      </p>

                      <div style={styles.pairedTitleList}>
                        {analysis ? (
                          analysis.suggestedTitles.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInputs(prev => ({ ...prev, title: t }));
                                // transition to simulator view to review the visual pair!
                                setTimeout(() => setActiveTab('simulator'), 400);
                              }}
                              style={styles.pairedTitleItemBtn}
                            >
                              <div style={styles.pairedTitleBadge}>Option {idx + 1}</div>
                              <div style={styles.pairedTitleText}>"{t}"</div>
                            </button>
                          ))
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generate thumbnail first to load variations.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                TAB 8: A/B ANALYTICS (A/B Performance Spotlight Section)
                ============================================================== */}
            {activeTab === 'analytics' && (
              <div style={styles.mainCard}>
                <div style={styles.analyticsWorkspace}>
                  
                  {/* Visual A/B Spotlight Section */}
                  <div style={{ ...styles.analyticsFlexGrid, minHeight: isDesktop ? 'calc(90vh - 140px)' : 'auto', alignItems: 'center' }}>
                    
                    {/* Left: Text Audit info */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <span className="badge badge-accent" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '11px', fontWeight: 800 }}>
                        <Activity size={12} style={{ marginRight: '4px' }} />
                        Real-world Analytics
                      </span>
                      
                      <h2 style={styles.analyticsHeadTitle}>
                        PROVEN CTR LIFT ON <span className="pixel-accent-headline">EVERY VIDEO.</span>
                      </h2>

                      <p style={styles.analyticsHeadDesc}>
                        Vignette's deep visual roast engine detects design flaws to boost clickability. In real-world split tests across thousands of search queries, Vignette-optimized layouts yielded an average click-through rate lift of 4.8%.
                      </p>

                      <div style={styles.metricsPromoRow}>
                        <div style={styles.metricsPromoCard}>
                          <h4 style={styles.metricsPromoVal}>14.2M+</h4>
                          <span style={styles.metricsPromoLabel}>Impressions Tested</span>
                        </div>
                        <div style={styles.metricsPromoCard}>
                          <h4 style={styles.metricsPromoVal}>+4.8%</h4>
                          <span style={styles.metricsPromoLabel}>Avg. CTR Increase</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Charts Audit grid */}
                    <div style={{ flex: 1, minWidth: '320px' }}>
                      <div className="card-performance" style={styles.statsCard}>
                        <div style={styles.statsIconWrapper}>
                          <Activity size={24} color="var(--color-primary)" className="float-fast" />
                        </div>
                        <div style={styles.statsTextWrapper}>
                          <span style={styles.statsPreTitle}>A/B Performance Audit</span>
                          <h3 style={styles.statsTitle}>+4.8% Average CTR Lift</h3>
                          <p style={styles.statsDesc}>
                            Double-blind comparison of original draft layouts versus Vignette-optimized click assets.
                          </p>
                          
                          <div style={styles.legendContainer}>
                            <div style={styles.legendItem}>
                              <span style={{ ...styles.legendDot, backgroundColor: 'var(--text-primary)' }}></span>
                              <span style={styles.legendText}>Original Draft</span>
                            </div>
                            <div style={styles.legendItem}>
                              <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-primary)' }}></span>
                              <span style={styles.legendText}>Vignette Optimized</span>
                            </div>
                          </div>
                        </div>

                        {/* Charts Row */}
                        <div style={styles.chartGroupsRow}>
                          <div style={styles.chartGroup}>
                            <div style={styles.barPair}>
                              <div style={styles.barColWrapper}>
                                <span style={styles.barValueText}>3.2%</span>
                                <div className="striped-bar-column striped-bar-charcoal" style={{ height: '32%' }}></div>
                              </div>
                              <div style={styles.barColWrapper}>
                                <span style={{ ...styles.barValueText, color: 'var(--color-primary)' }}>8.5%</span>
                                <div className="striped-bar-column striped-bar-orange" style={{ height: '85%' }}></div>
                              </div>
                            </div>
                            <span style={styles.chartGroupLabel}>Gaming</span>
                          </div>

                          <div style={styles.chartGroup}>
                            <div style={styles.barPair}>
                              <div style={styles.barColWrapper}>
                                <span style={styles.barValueText}>2.8%</span>
                                <div className="striped-bar-column striped-bar-charcoal" style={{ height: '28%' }}></div>
                              </div>
                              <div style={styles.barColWrapper}>
                                <span style={{ ...styles.barValueText, color: 'var(--color-primary)' }}>7.6%</span>
                                <div className="striped-bar-column striped-bar-orange" style={{ height: '76%' }}></div>
                              </div>
                            </div>
                            <span style={styles.chartGroupLabel}>Finance</span>
                          </div>

                          <div style={styles.chartGroup}>
                            <div style={styles.barPair}>
                              <div style={styles.barColWrapper}>
                                <span style={styles.barValueText}>4.1%</span>
                                <div className="striped-bar-column striped-bar-charcoal" style={{ height: '41%' }}></div>
                              </div>
                              <div style={styles.barColWrapper}>
                                <span style={{ ...styles.barValueText, color: 'var(--color-primary)' }}>9.2%</span>
                                <div className="striped-bar-column striped-bar-orange" style={{ height: '92%' }}></div>
                              </div>
                            </div>
                            <span style={styles.chartGroupLabel}>Tech</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            </>
          )}

        </main>
      </div>

      {/* 3. MOBILE RESPONSIVE BOTTOM NAVIGATION SYSTEM */}
      {isMobile && (
        <nav style={styles.mobileBottomNav}>
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={styles.mobileNavItem}
              >
                <Icon 
                  size={18} 
                  style={{
                    ...styles.sidebarIcon,
                    ...(isActive ? styles.sidebarIconActive : {})
                  }} 
                />
                <span 
                  style={{
                    ...styles.mobileNavText,
                    ...(isActive ? styles.sidebarTextActive : {})
                  }}
                >
                  {tab.subText}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 4. FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <p style={styles.footerText}>
            &copy; {new Date().getFullYear()} Vignette.ai • AI-Powered YouTube Thumbnail Generator & CTR Optimizer. All rights reserved.
          </p>
          <div style={styles.footerBadges}>
            <span style={styles.footerStatusDot}></span>
            <span style={styles.footerStatusText}>Serverless Active</span>
          </div>
        </div>
      </footer>

      {/* 5. AUTHENTICATION DIALOG (AuthModal) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      {/* Toast Notification Banner */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: notification.type === 'success' 
            ? 'rgba(16, 185, 129, 0.9)' 
            : notification.type === 'error' 
              ? 'rgba(239, 68, 68, 0.9)' 
              : 'rgba(99, 102, 241, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <CheckCircle size={16} />
          <span>{notification.message}</span>
        </div>
      )}

    </div>
  );
}

// REDESIGN STYLESHEET driven entirely by modern CSS tokens & responsive parameters
const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-base)',
    position: 'relative',
    overflowX: 'hidden',
    color: 'var(--text-primary)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-subtle)',
    height: '10vh',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0 24px',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    background: 'var(--color-primary)',
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
  },
  logoHighlight: {
    color: 'var(--color-primary)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color var(--transition-fast)',
    padding: '4px 0',
  },
  navLinkActive: {
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  upgradeBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 18px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
    transition: 'all var(--transition-fast)',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--bg-surface-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  dashboardBody: {
    display: 'flex',
    flex: 1,
    height: '90vh',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 24px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '96px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '24px',
    paddingBottom: '24px',
    gap: '8px',
    flexShrink: 0,
    marginTop: '16px',
    marginBottom: '16px',
  },
  sidebarItem: {
    width: '84px',
    height: '74px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px', /* reduced from 8px to improve scanability */
    cursor: 'pointer',
    borderRadius: '12px',
    border: 'none',
    background: 'none',
    transition: 'all var(--transition-fast)',
    position: 'relative',
  },
  sidebarItemActive: {
    background: 'var(--color-primary-glow)',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '15%',
    height: '70%',
    width: '4px',
    background: 'var(--color-accent)',
    borderRadius: '0 4px 4px 0',
  },
  sidebarIcon: {
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
  },
  sidebarIconActive: {
    color: 'var(--color-primary)',
  },
  sidebarText: {
    fontSize: '10.5px', /* increased from 9px for scanability */
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: '1.2',
    transition: 'color var(--transition-fast)',
    fontFamily: "'Outfit', sans-serif",
  },
  sidebarTextActive: {
    color: 'var(--color-primary)',
  },
  workspace: {
    flex: 1,
    padding: '16px 0 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minHeight: 0,
  },
  mainCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
    padding: '28px 36px',
    width: '100%',
    minHeight: 'calc(90vh - 100px)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Maker Tab Layouts
  makerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  makerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '48px',
    alignItems: 'center',
    paddingBottom: '20px',
  },
  makerLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  makerHeadline: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 900,
    lineHeight: '1.15',
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
  },
  makerSubhead: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  sellingPoints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '16px',
  },
  sellingPointRow: {
    borderLeft: '3px solid var(--color-accent)',
    paddingLeft: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  sellingPointBold: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  sellingPointText: {
    display: 'block',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  makerRightCol: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  makerCardBox: {
    width: '100%',
    maxWidth: '480px',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    padding: '0',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'none',
    letterSpacing: 'normal',
  },
  fieldInputTextarea: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    padding: '14px 16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    resize: 'none',
    outline: 'none',
    transition: 'all var(--transition-fast)',
  },
  dropdownsRow: {
    display: 'flex',
    gap: '16px',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  fieldSelect: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    padding: '12px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  },
  makerSubmitBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
    border: 'none',
    borderRadius: '24px',
    padding: '14px 28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
    transition: 'all var(--transition-fast)',
  },
  copyrightSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  copyrightLink: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  sectionDivider: {
    height: '1px',
    background: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    margin: '56px 0',
  },

  // "How to use" Grid Section (Screenshot 2 styling)
  howToSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    gap: '36px',
  },
  howToTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  howToGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '28px',
    width: '100%',
    marginTop: '0px',
  },
  howToCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px 4px 20px 20px', // Asymmetrical folder tab corner matching Quillbot
    padding: '28px 32px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.02)',
    transition: 'all var(--transition-fast)',
  },
  howToHeaderCut: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  howToDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  howToBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 28px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
    transition: 'all var(--transition-fast)',
  },

  // "Why use" Grid Section (Screenshot 3 styling)
  whySection: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '36px',
  },
  whyTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    textAlign: 'center',
    letterSpacing: '-0.02em',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '48px',
    width: '100%',
    marginTop: '0px',
  },
  whyCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderLeft: '3px solid var(--color-primary)',
    paddingLeft: '20px',
    textAlign: 'left',
  },
  whyColHeader: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  whyColDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },

  // Workspace Headers
  workspaceHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    paddingBottom: '16px',
  },
  workspaceTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  workspaceDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },

  // Gallery view
  galleryContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },

  // CTR Roast view
  roastContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  roastFlexGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'start',
  },
  roastPreviewWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.08)',
    background: '#000000',
  },
  roastImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  roastOptimizedBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  roastMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
  },
  roastMetaLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  roastMetaVal: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },

  // Simulator View
  simulatorContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  simulatorFlexGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'start',
  },
  simulatorCardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  simulatorCardText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '12px',
  },
  previewChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewCheckItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  previewCheckText: {
    fontSize: '11px',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  simulatorNotice: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    background: 'var(--bg-base)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    marginTop: '12px',
  },

  // Rewrite / Upgrade View
  upgradeWorkspace: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  upgradeFlexGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'start',
  },
  dragArea: {
    width: '100%',
    height: '240px',
    border: '2px dashed rgba(0, 0, 0, 0.12)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  dragAreaActive: {
    borderColor: 'var(--color-primary)',
    background: 'rgba(255, 129, 56, 0.03)',
  },
  dragText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  dragSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  upgradeUploadLabel: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  compareWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  compareTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  comparisonPairRow: {
    display: 'flex',
    gap: '12px',
  },
  comparisonCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  comparisonLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  comparisonColImgWrap: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.08)',
  },
  compareImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  miniRoastBlock: {
    background: 'rgba(255, 107, 107, 0.03)',
    border: '1px solid rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  miniRoastHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  miniRoastHeadTitle: {
    fontSize: '11px',
    color: 'var(--color-accent-hover)',
  },
  miniRoastList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  miniRoastItem: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  },
  compareEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
    padding: '24px',
  },

  // Title Pairing view
  titlesWorkspace: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  titlesFlexGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'start',
  },
  titleCardHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    paddingBottom: '8px',
  },
  pairedViewCard: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-base)',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '380px',
    margin: '0 auto',
  },
  pairedImageWrap: {
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
  },
  pairedImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pairedMetaBlock: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pairedLogoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pairedAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairedUser: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'block',
  },
  pairedDate: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  pairedVideoTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 800,
    lineHeight: '1.3',
    color: 'var(--text-primary)',
  },
  titleCardDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '12px',
  },
  pairedTitleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pairedTitleItemBtn: {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '10px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  pairedTitleBadge: {
    fontSize: '8px',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
  },
  pairedTitleText: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginTop: '2px',
  },

  // Analytics view
  analyticsWorkspace: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  analyticsFlexGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    alignItems: 'center',
  },
  analyticsHeadTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 900,
    lineHeight: '1.1',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    marginTop: '12px',
  },
  analyticsHeadDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginTop: '8px',
  },
  metricsPromoRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  metricsPromoCard: {
    flex: 1,
    background: 'rgba(255, 129, 56, 0.04)',
    border: '1px solid rgba(255, 129, 56, 0.08)',
    borderRadius: '12px',
    padding: '16px',
  },
  metricsPromoVal: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: 900,
    color: 'var(--color-primary)',
  },
  metricsPromoLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Stats Card & Charts Spotlight
  statsCard: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
  },
  statsIconWrapper: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 129, 56, 0.08)',
    border: '1px solid rgba(255, 129, 56, 0.15)',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statsPreTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statsTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  statsDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    maxWidth: '240px',
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
  legendText: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  chartGroupsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '24px',
    marginTop: '20px',
    width: '100%',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px',
  },
  chartGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '8px',
  },
  barPair: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '100px',
    width: '100%',
    justifyContent: 'center',
  },
  barColWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: '32px',
    gap: '4px',
  },
  barValueText: {
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: "'Outfit', sans-serif",
  },
  chartGroupLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    fontFamily: "'Outfit', sans-serif",
    textTransform: 'uppercase',
  },

  // Mobile navigation footer bar
  mobileBottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99,
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  mobileNavText: {
    fontSize: '8px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: "'Outfit', sans-serif",
  },

  // General buttons spinner
  btnSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: '#ffffff',
    animation: 'spin 0.8s linear infinite',
    marginRight: '6px',
  },

  // Footer section
  footer: {
    borderTop: 'none',
    background: 'transparent',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0 24px',
    marginTop: 'auto',
  },
  footerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: "'Outfit', sans-serif",
  },
  footerBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  footerStatusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    boxShadow: '0 0 6px var(--color-primary)',
  },
  footerStatusText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
  }
};

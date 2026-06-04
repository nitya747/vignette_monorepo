'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FolderClosed, 
  Flame, 
  UploadCloud, 
  Plus, 
  Activity, 
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle,
  Eye
} from 'lucide-react';

// Subcomponents
import Gallery from './components/Gallery';
import YoutubePreview from './components/YoutubePreview';
import ThreeMascot from './components/ThreeMascot';
import AuthModal from './components/AuthModal';
import LibraryPanel from './components/LibraryPanel';
import LandingPage from './components/LandingPage';

// Supabase client instance
import { supabase } from './lib/supabase';

// Library utilities
import { compilePrompt } from './lib/prompts';
import { generateThumbnailImage, analyzeThumbnailCTR, uploadReferenceImage } from './lib/imageService';
import { compileLearningModifiers } from './lib/database';

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
      case '/preview': return 'simulator';
      case '/roast': return 'roast';
      case '/editor': return 'editor';
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
      case 'simulator': navigate('/preview'); break;
      case 'roast': navigate('/roast'); break;
      case 'editor': navigate('/editor'); break;
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
  const [selectedNiche, setSelectedNiche] = useState('default');
  const [selectedArchetype, setSelectedArchetype] = useState('default');
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  
  const [imageUrl, setImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [provider, setProvider] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  const [analysis, setAnalysis] = useState(null);
  const setShowCritique = () => {};
  const setAnalysisError = () => {};

  const getVigiMessage = () => {
    if (isOptimizing) {
      return "Let's make it more clickable.";
    }
    if (isGenerating) {
      return "Cooking something interesting...";
    }
    if (imageUrl) {
      return "This one might perform well.";
    }
    return "Describe your topic on the left to craft art!";
  };

  // Supabase Auth and History States
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSaved, setIsSaved] = useState(false);
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('vignette_credits');
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    localStorage.setItem('vignette_credits', credits.toString());
  }, [credits]);

  const [guestId] = useState(() => {
    let id = localStorage.getItem('vignette_guest_id');
    if (!id) {
      id = 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('vignette_guest_id', id);
    }
    return id;
  });

  const fetchCreditsIdRef = useRef(0);

  const fetchUserCredits = useCallback(async (currentSession) => {
    const activeSession = currentSession || session;
    const token = activeSession?.access_token || guestId;
    if (!token) return;

    // Track request ID to prevent async race conditions
    const requestId = ++fetchCreditsIdRef.current;

    // Direct Frontend Query Fallback: If user is authenticated and supabase is initialized,
    // fetch the exact real credits directly from the database, so UI is instantly accurate.
    if (supabase && activeSession?.user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', activeSession.user.id)
          .single();
        if (!error && data && data.credits !== undefined) {
          if (requestId === fetchCreditsIdRef.current) {
            console.log('[Supabase Frontend] Directly fetched user credits:', data.credits);
            setCredits(data.credits);
          }
        } else if (error) {
          console.error('[Supabase Frontend] Direct credit fetch failed:', error);
        }
      } catch (directErr) {
        console.error('[Supabase Frontend] Direct credit fetch error:', directErr);
      }
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // If user is authenticated, pass guestId as query param to link/migrate spent credits
      const url = activeSession?.user
        ? `/api/history/credits?guestId=${guestId}&t=${Date.now()}`
        : `/api/history/credits?t=${Date.now()}`;

      const res = await fetch(url, { 
        headers,
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        // Guard against race conditions: only update if this request is still active
        if (requestId === fetchCreditsIdRef.current) {
          setCredits(data.credits);
        } else {
          console.warn('[Credits Fetch] Ignored stale response from request ID:', requestId);
        }
      }
    } catch (err) {
      if (requestId === fetchCreditsIdRef.current) {
        console.error('[Credits Fetch Error]', err);
      }
    }
  }, [session, guestId]);

  // Sync Supabase Auth listener
  useEffect(() => {
    if (!supabase) {
      // Sandbox Mode: Check if there's a cached mock user session
      const savedUser = localStorage.getItem('vignette_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setTimeout(() => {
            setUser(parsed);
            setSession({ access_token: 'sandbox-jwt-token-secret-123456789', user: parsed });
          }, 0);
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

  useEffect(() => {
    setTimeout(() => {
      fetchUserCredits(session);
    }, 0);
  }, [user, session, guestId, fetchUserCredits]);

  // Real-time subscription to user credits in profiles table
  useEffect(() => {
    if (!supabase || !user) return;

    console.log('[Supabase Realtime] Subscribing to credit updates for user:', user.id);

    const profileChannel = supabase
      .channel(`profile-credits-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('[Supabase Realtime] Received profile update:', payload);
          if (payload.new && payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Subscription status for user ${user.id}:`, status);
      });

    return () => {
      console.log('[Supabase Realtime] Unsubscribing from credit updates for user:', user.id);
      supabase.removeChannel(profileChannel);
    };
  }, [user]);


  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('vignette_mock_user');
      setUser(null);
      setSession(null);
    }
    // Fetch and reset credits to guest level
    fetchUserCredits(null);
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
    
    // Fetch credits immediately upon auth success
    fetchUserCredits(newSession);

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag and drop / secondary upload rewrite state
  const [dragActive, setDragActive] = useState(false);
  
  // (Removed YouTube URL inputs/loading states)

  // User Photo Upload (use-your-photo feature)
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const userPhotoInputRef = useRef(null);

  // Sync window viewport for mobile responsiveness
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isDesktop = viewportWidth >= 992;
  const isMobile = viewportWidth < 768;

  // Compile and generate thumbnail image based on prompt state (Task 1.3 / 1.4)
  const handleGenerate = async () => {
    if (!inputs.title.trim()) return;
    if (credits < 1) {
      showToast(user ? 'Insufficient credits. Please upgrade your plan or top up to generate more thumbnails.' : 'Insufficient credits. Please sign in or register to get 4 additional credits!', 'error');
      return;
    }
    
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
      const result = await generateThumbnailImage(prompt, selectedNiche, selectedArchetype, aspectRatio, userPhotoUrl, session?.access_token || guestId, inputs.title, inputs.topic, inputs.keywords);
      setImageUrl(result.imageUrl);
      setProvider(result.provider);
      
      // Warn user if we fell back to a mock image due to an API error
      if (result.provider && result.provider.startsWith('API Error Fallback')) {
        console.warn('[Generate] API Error Fallback detected:', result.provider);
        showToast('Image generation encountered an error — showing a placeholder. Check console for details.', 'error');
      }
      
      if (result.remainingCredits !== undefined) {
        setCredits(result.remainingCredits);
        if (result.remainingCredits === 0) {
          showToast('You have used your last thumbnail credit!', 'warning');
        }
      } else {
        // Fallback: Decrement locally and directly update Supabase from frontend if logged in
        setCredits(prev => {
          const next = Math.max(0, prev - 1);
          if (supabase && user) {
            supabase
              .from('profiles')
              .update({ credits: next })
              .eq('id', user.id)
              .then(({ error }) => {
                if (error) console.error('[Supabase Frontend] Direct credit decrement failed:', error);
                else console.log('[Supabase Frontend] Direct credit decrement succeeded. New balance:', next);
              });
          }
          if (next === 0) {
            showToast('You have used your last thumbnail credit!', 'warning');
          }
          return next;
        });
      }
      
      // Successfully generated: smooth transition to visual blueprint tab!
      setTimeout(() => {
        setActiveTab('roast');
      }, 800);
    } catch (error) {
      console.error('Generation pipeline failure:', error);
      if (error.message.includes('credits') || error.message.includes('Insufficient') || error.message.includes('top up')) {
        showToast(error.message, 'error');
        setCredits(0);
      } else {
        setAnalysisError('Vignette\'s visual intelligence network failed to complete the layout scan. The server reported a rate limit or API connection error.');
      }
    } finally {
      setIsGenerating(false);
      setIsCooldown(true);
      setTimeout(() => {
        setIsCooldown(false);
      }, 3000);
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

  // Handle change in search input directly (without YouTube auto-extract intercept)
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setInputs(prev => ({ ...prev, title: val }));
  };

  // Handle user self-photo upload for thumbnail maker
  const handleUserPhotoUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    // Create local preview immediately for reactive UI
    const localUrl = URL.createObjectURL(file);
    setUserPhotoUrl(localUrl); // Temporarily show local blob
    
    try {
      showToast('Uploading subject photo securely...', 'info');
      const signedUrl = await uploadReferenceImage(file, user?.id || 'guest');
      setUserPhotoUrl(signedUrl); // Set state to the final signed URL
      showToast('Photo uploaded! Click "Generate" to let AI edit your photo.', 'success');
    } catch (error) {
      console.error('Failed to upload reference photo to Supabase:', error);
      setUserPhotoUrl(null);
      showToast('Failed to upload photo. Please check your internet connection.', 'error');
    }
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


  const sidebarTabs = [
    { id: 'gallery', label: 'Projects', icon: FolderClosed, subText: 'Projects' },
    { id: 'simulator', label: 'Feed Preview', icon: Eye, subText: 'Preview' },
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
            fontFamily: "'Fredoka', sans-serif",
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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Wide, full height matching reference) */}
      {!isMobile && (
        <aside style={{
          ...styles.sidebar,
          background: '#FFFDF9',
          borderRight: '1.5px solid rgba(18, 27, 51, 0.06)'
        }}>
          {/* Logo Group */}
          <div style={{ ...styles.logoGroup, padding: '24px 20px', width: '100%', display: 'flex', gap: '10px' }} onClick={() => { setActiveTab('landing'); }}>
            <div style={{ ...styles.logoIcon, background: 'var(--color-secondary)', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
            </div>
            <span style={{ ...styles.logoText, fontFamily: "'Fredoka', sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>vignette.ai</span>
          </div>

          {/* Stacked New Button with doodle loops */}
          <div style={{ width: '100%', padding: '0 20px', marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              {/* Hand-drawn curly loops SVG */}
              <svg viewBox="0 0 30 30" width="30" height="30" style={{ position: 'absolute', top: '-12px', right: '-24px', overflow: 'visible', pointerEvents: 'none', zIndex: 10 }}>
                <path d="M2,24 C8,18 5,10 12,12 C18,14 14,22 10,20 C6,18 8,8 18,6" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
                <path d="M8,26 C14,20 11,12 18,14 C24,16 20,24 16,22 C12,20 14,10 24,8" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>

              <button
                onClick={() => { setActiveTab('maker'); handleReset(); }}
                style={{
                  width: '110px',
                  height: '110px',
                  background: '#FF5B37',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(255, 91, 55, 0.25)',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Fredoka', sans-serif",
                  padding: '0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Hand-drawn style inner border */}
                <div style={{
                  position: 'absolute',
                  inset: '7px',
                  border: '1.8px dashed rgba(255, 255, 255, 0.65)',
                  borderRadius: '16px',
                  pointerEvents: 'none'
                }}></div>

                <div style={{
                  border: '1.8px solid #ffffff',
                  borderRadius: '8px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <Plus size={20} strokeWidth={3.5} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, zIndex: 2 }}>New</span>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', padding: '0 20px', alignItems: 'flex-start' }}>
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'simulator' && activeTab === 'roast');
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    height: '42px',
                    padding: '0 8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <Icon 
                      size={20} 
                      style={{
                        color: isActive ? 'var(--color-secondary)' : 'var(--text-primary)',
                        strokeWidth: isActive ? 2.5 : 2,
                      }} 
                    />
                    {/* Tiny hand-drawn star above active icon */}
                    {isActive && (
                      <svg viewBox="0 0 10 10" width="8" height="8" fill="var(--color-primary)" style={{ position: 'absolute', top: '-6px', right: '-4px' }}>
                        <polygon points="5 0 6.1 3.5 9.7 3.5 6.8 5.7 7.9 9.2 5 7.1 2.1 9.2 3.2 5.7 0.3 3.5 3.9 3.5" />
                      </svg>
                    )}
                  </div>
                  <span 
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: '15px',
                      fontWeight: isActive ? 800 : 700,
                      color: isActive ? 'var(--color-secondary)' : 'var(--text-primary)',
                      paddingBottom: '2px',
                      transition: 'color 0.2s'
                    }}
                  >
                    {tab.subText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pro Tip Card */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '2px dashed var(--color-accent)',
            borderRadius: '16px',
            padding: '14px',
            margin: 'auto 20px 20px 20px',
            width: 'calc(100% - 40px)',
            position: 'relative',
            boxShadow: 'none',
            textAlign: 'left',
            zIndex: 2
          }}>
            {/* Hand-drawn yellow outline star sticker at top right */}
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ position: 'absolute', top: '-10px', right: '12px', transform: 'rotate(15deg)' }}>
              <path d="M12,2 L15,9 L22,9 L17,14 L19,21 L12,17 L5,21 L7,14 L2,9 L9,9 Z" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-secondary)',
              margin: '0 0 4px 0'
            }}>Pro Tip</h4>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              margin: 0
            }}>Great thumbnails tell a story before the click.</p>
            {/* Red hand-drawn squiggle doodle at bottom */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
              <svg viewBox="0 0 100 20" width="50" height="10" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
                <path d="M5,12 C25,4 45,15 65,8 C75,5 85,12 95,9" />
              </svg>
            </div>
          </div>

          {/* Bottom Crayon Scribbles */}
          <svg viewBox="0 0 120 120" width="100" height="100" style={{ position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
            <path d="M5,110 C20,90 10,70 30,50 C40,40 50,60 40,80 C30,100 50,90 70,70" fill="none" stroke="rgba(255, 91, 55, 0.45)" strokeWidth="8" strokeLinecap="round" />
            <path d="M15,115 C25,105 35,95 45,85" fill="none" stroke="rgba(255, 178, 107, 0.45)" strokeWidth="12" strokeLinecap="round" />
            <path d="M5,120 C15,115 35,105 45,95" fill="none" stroke="rgba(126, 91, 250, 0.35)" strokeWidth="10" strokeLinecap="round" />
            <path d="M25,125 C35,115 55,105 65,95" fill="none" stroke="rgba(71, 193, 163, 0.35)" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </aside>
      )}

      {/* 2. RIGHT MAIN CONTENT COLUMN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Redesigned Floating top header actions row */}
        <header style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 24px',
          height: '64px',
          width: '100%',
        }}>
          <div style={styles.headerActions}>
            <button 
              onClick={() => setActiveTab('roast')}
              style={{
                ...styles.upgradeBtn,
                background: '#7E5BFA',
                boxShadow: '0 6px 16px rgba(126, 91, 250, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#ffbe0b" stroke="#ffbe0b" strokeWidth="2" style={{ marginRight: '2px', verticalAlign: 'middle', display: 'inline-block' }}>
                <path d="M2 4L5 12L12 6L19 12L22 4L17 18H7L2 4Z" />
              </svg>
              Upgrade to Premium
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFEEDC',
              borderRadius: '999px',
              padding: '6px 14px',
              gap: '4px',
              height: '34px',
              border: 'none',
              boxShadow: 'none'
            }} title="Your available generation credits">
              <span style={{ color: '#FF8800', marginRight: '4px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </span>
              <span style={{ fontWeight: 800, fontFamily: "'Fredoka', sans-serif", color: 'var(--text-primary)', fontSize: '13px' }}>{credits}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: "'Fredoka', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginLeft: '4px' }}>Credits</span>
            </div>
            
            {/* Profile Avatar with dropdown */}
            <div ref={profileDropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
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
                  background: '#5E80F9',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: '15px',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(94, 128, 249, 0.25)',
                  border: 'none'
                }}>
                  {user && user.email ? user.email.charAt(0).toUpperCase() : 'N'}
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '200px',
                  background: '#ffffff',
                  border: '1px solid rgba(18, 27, 51, 0.08)',
                  boxShadow: '0 12px 32px rgba(18, 27, 51, 0.08)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(10px)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 1000
                }}>
                  {user ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 8px', textAlign: 'left' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>{user.email}</span>
                        <span style={{ fontSize: '9px', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authenticated</span>
                      </div>
                      <div style={{ height: '1px', background: 'rgba(18, 27, 51, 0.08)', margin: '4px 0' }}></div>
                      <button 
                        onClick={() => { handleSignOut(); setShowProfileDropdown(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          fontFamily: "'Fredoka', sans-serif",
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
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 8px', textAlign: 'left' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Guest Mode</span>
                        <span style={{ fontSize: '9px', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temporary Session</span>
                      </div>
                      <div style={{ height: '1.5px', background: 'var(--text-primary)', margin: '4px 0' }}></div>
                      <button 
                        onClick={() => { setIsAuthOpen(true); setShowProfileDropdown(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          fontFamily: "'Fredoka', sans-serif",
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
                      >
                        Sign In / Join
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{
          ...(activeTab === 'maker' ? {
            flex: 1,
            margin: '0',
            padding: '12px 48px 24px 48px',
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          } : styles.workspace),
          overflowY: 'auto'
        }}>
          
          {activeTab === 'maker' ? (
            <div className="tech-dot-grid" style={{ ...styles.makerContainer, position: 'relative', overflow: 'hidden', padding: '0', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              
              {/* Glowing decorative background gradient shapes (Reference Inspired) */}
              <div style={{
                position: 'absolute',
                top: '-200px',
                right: '-100px',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 178, 107, 0.1) 0%, transparent 70%)',
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
                background: 'radial-gradient(circle, rgba(255, 122, 89, 0.08) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none',
              }}></div>

              {/* ==========================================
                  1. HERO SECTION (Separate Individual Section - Spaced & Clean)
                  ========================================== */}
              <section style={{ 
                position: 'relative', 
                zIndex: 1, 
                padding: '40px 48px', 
                width: '100%',
                minHeight: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '40px',
                  maxWidth: '1200px',
                  width: '100%',
                  margin: '0 auto'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isDesktop ? '1.25fr 0.75fr' : '1fr', 
                    gap: '48px', 
                    alignItems: 'center',
                    width: '100%'
                  }}>
                  
                  {/* Left Column: Value Proposition & Glass Prompt compiler */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', justifyContent: 'center', position: 'relative' }}>
                    {/* Brand Title & Intro with custom SVGs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
                        {/* Purple Sparks above "Create" */}
                        <svg viewBox="0 0 30 30" width="30" height="30" strokeLinecap="round" style={{ position: 'absolute', top: '-22px', left: '160px', pointerEvents: 'none', fill: 'none', stroke: 'var(--color-secondary)', strokeWidth: '2.5' }}>
                          <path d="M10,24 L6,14 M15,22 L15,10 M20,24 L24,14" />
                        </svg>

                        {/* Purple star next to "Thumbnails." */}
                        <svg viewBox="0 0 24 24" width="22" height="22" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', bottom: '15px', right: '-32px', pointerEvents: 'none', fill: 'none', stroke: 'var(--color-secondary)', strokeWidth: '2' }}>
                          <path d="M12,2 L15,9 L22,9 L17,14 L19,21 L12,17 L5,21 L7,14 L2,9 L9,9 Z" />
                        </svg>
                        
                        {/* Purple star above the main section in the empty gap */}
                        <svg viewBox="0 0 24 24" width="18" height="18" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '-25px', right: '-40px', pointerEvents: 'none', fill: 'none', stroke: 'var(--color-secondary)', strokeWidth: '1.8', opacity: 0.8 }}>
                          <path d="M12,2 L15,9 L22,9 L17,14 L19,21 L12,17 L5,21 L7,14 L2,9 L9,9 Z" />
                        </svg>

                        <h1 style={{ 
                          fontFamily: "'Fredoka', sans-serif",
                          fontSize: 'clamp(44px, 5.2vw, 62px)', 
                          fontWeight: 900, 
                          color: 'var(--text-primary)', 
                          lineHeight: '1.08', 
                          letterSpacing: '-0.02em', 
                          margin: 0 
                        }}>
                          Create<br />
                          <span style={{ color: '#FF5B37' }}>Scroll-Stopping</span><br />
                          <span style={{ position: 'relative', display: 'inline-block' }}>
                            Thumbnails.
                            {/* Purple hand-drawn style underline */}
                            <svg viewBox="0 0 100 10" width="100%" height="8" style={{ position: 'absolute', bottom: '-8px', left: 0, overflow: 'visible' }}>
                              <path d="M5,4 C35,1 70,6 95,3" fill="none" stroke="var(--color-secondary)" strokeWidth="3.5" strokeLinecap="round" />
                            </svg>
                          </span>
                        </h1>
                      </div>
                      
                      <p style={{ ...styles.makerSubhead, fontSize: '15.5px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '560px', margin: '8px 0 0 0' }}>
                        Secure, serverless platform to generate powerful AI thumbnails and performance optimization. What will you create today?
                      </p>
                    </div>

                    {/* Redesigned Search & Generate Capsule Bar */}
                    <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '720px', marginTop: '4px' }}>
                      <div style={{ 
                        padding: '6px 8px 6px 18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        width: '100%', 
                        position: 'relative',
                        background: '#ffffff',
                        border: '1px solid rgba(18, 27, 51, 0.08)',
                        borderRadius: '999px',
                        boxShadow: '0 16px 36px rgba(18, 27, 51, 0.06), 0 4px 10px rgba(18, 27, 51, 0.02)'
                      }}>
                        
                        {/* Prompt Input */}
                        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                          </svg>
                          <input 
                            type="text"
                            value={inputs.title}
                            onChange={handleSearchInputChange}
                            placeholder="Describe your video topic..."
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          />
                        </div>

                        {/* Use Your Photo button styled with soft outline */}
                        <label
                          title="Upload your own photo to use as thumbnail"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#ffffff',
                            border: '1.5px solid rgba(18, 27, 51, 0.15)',
                            borderRadius: '999px',
                            padding: '8px 18px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            boxShadow: '0 2px 5px rgba(18, 27, 51, 0.03)'
                          }}
                          className="user-photo-upload-btn"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
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

                        {/* Generate button styled with linear-gradient and four-point sparkle */}
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || isCooldown || !inputs.title.trim()}
                          style={{ 
                            background: 'linear-gradient(135deg, #FF5B37 0%, #FF7A59 100%)', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '999px', 
                            padding: '10px 24px', 
                            fontSize: '14.5px', 
                            fontWeight: 700, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            cursor: 'pointer', 
                            boxShadow: '0 6px 18px rgba(255, 91, 55, 0.3)', 
                            transition: 'all 0.15s ease',
                            fontFamily: "'Fredoka', sans-serif" 
                          }}
                        >
                          {isGenerating ? (
                            'Craftin...'
                          ) : (
                            <>
                              Generate
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none">
                                <path d="M12,2 Q12,12 2,12 Q12,12 12,22 Q12,12 22,12 Q12,12 12,2 Z" />
                              </svg>
                            </>
                          )}
                        </button>

                      </div>
                    </div>

                    {/* FORMAT TYPE ASPECT RATIO SELECTOR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', width: '100%', maxWidth: '780px', marginTop: '10px', paddingLeft: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          color: 'var(--text-primary)', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.08em', 
                          fontFamily: "'Fredoka', sans-serif",
                        }}>
                          FORMAT TYPE:
                        </span>
                        {/* Purple hand-drawn underline */}
                        <svg viewBox="0 0 100 10" width="70" height="6" style={{ position: 'absolute', bottom: '-4px', left: 0, overflow: 'visible' }}>
                          <path d="M2,5 Q50,2 98,6" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '12px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setAspectRatio('16:9')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 20px',
                              borderRadius: '999px',
                              fontSize: '13.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: '2px solid ' + (aspectRatio === '16:9' ? '#7E5BFA' : 'rgba(18, 27, 51, 0.08)'),
                              background: aspectRatio === '16:9' ? 'rgba(126, 91, 250, 0.06)' : '#ffffff',
                              color: aspectRatio === '16:9' ? '#7E5BFA' : 'var(--text-secondary)',
                              boxShadow: 'none',
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <polygon points="10 8 16 11 10 14 10 8" fill="currentColor" />
                            </svg>
                            Standard (16:9)
                          </button>
                          {aspectRatio === '16:9' && (
                            <svg viewBox="0 0 100 10" width="100%" height="8" style={{ position: 'absolute', bottom: '-8px', left: 0, overflow: 'visible' }}>
                              <path d="M5,4 C35,1 70,6 95,3" fill="none" stroke="#7E5BFA" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>

                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setAspectRatio('9:16')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 20px',
                              borderRadius: '999px',
                              fontSize: '13.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: '2px solid ' + (aspectRatio === '9:16' ? '#8B5A2B' : 'rgba(18, 27, 51, 0.08)'),
                              background: aspectRatio === '9:16' ? 'rgba(139, 90, 43, 0.06)' : '#ffffff',
                              color: aspectRatio === '9:16' ? '#8B5A2B' : 'var(--text-secondary)',
                              boxShadow: 'none',
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                            YouTube Shorts (9:16)
                          </button>
                          {aspectRatio === '9:16' && (
                            <svg viewBox="0 0 100 10" width="100%" height="8" style={{ position: 'absolute', bottom: '-8px', left: 0, overflow: 'visible' }}>
                              <path d="M5,4 C35,1 70,6 95,3" fill="none" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>

                        {/* Hand-drawn style curved arrow pointing to selectors */}
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', transform: 'rotate(-5deg) translateY(-2px)' }} title="Select format ratios!">
                          <svg viewBox="0 0 30 20" width="30" height="20" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M25,3 C18,12 8,14 3,11" />
                            <polyline points="7,6 2,11 8,16" />
                          </svg>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Interactive Thumbnail Preview or 3D Mascot */}
                  <div style={{ flex: 1.0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px', height: 'auto' }}>

                    {isGenerating ? (
                      <div style={{ width: '100%', maxWidth: '520px' }}>
                        <Gallery 
                          imageUrl={imageUrl} 
                          isGenerating={isGenerating} 
                          onAnalyze={() => {}}
                          originalImageUrl={originalImageUrl}
                          provider={provider}
                          isOptimized={isOptimized}
                          aspectRatio={aspectRatio}
                          title={inputs.title}
                          onSaveToLibrary={handleSaveToLibrary}
                          isSaved={isSaved}
                        />
                      </div>
                    ) : (
                      <>
                        {userPhotoUrl ? (
                          /* === USER PHOTO SELECTION PREVIEW === */
                          <div className="card-glass" style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', textAlign: 'center', animation: 'dropdownFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffbe0b', animation: 'pulse 1.5s infinite' }}></div>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Fredoka', sans-serif" }}>Subject Photo Loaded</span>
                            </div>

                            <div style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '16px', overflow: 'hidden', margin: '0 auto', border: '2.5px solid var(--color-primary-glow)', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.12)' }}>
                              <img 
                                src={userPhotoUrl} 
                                alt="Uploaded subject" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            </div>

                            <div>
                              <h4 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>AI Composite Source Active</h4>
                              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                                Vignette AI will seamlessly extract this subject, apply professional rim lighting, and compose a premium high-CTR thumbnail layout.
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
                              <button
                                onClick={() => userPhotoInputRef.current?.click()}
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                              >
                                Change Photo
                              </button>
                              <button
                                onClick={handleClearUserPhoto}
                                className="btn btn-danger"
                                style={{ fontSize: '11px', padding: '6px 12px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: 'var(--color-danger)' }}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* === DEFAULT 3D MASCOT === */
                          <>
                            {/* Premium speech bubble with custom doodle style */}
                            <div 
                              className="floating-speech-bubble"
                              style={{
                                position: 'absolute',
                                top: '0px',
                                left: isDesktop ? '-30px' : '10px',
                                zIndex: 10,
                                background: '#ffffff',
                                border: '1.5px solid rgba(18, 27, 51, 0.08)',
                                borderRadius: '16px 16px 4px 16px',
                                padding: '10px 16px',
                                maxWidth: '200px',
                                boxShadow: '0 8px 24px rgba(18, 27, 51, 0.05)',
                                pointerEvents: 'none'
                              }}
                            >
                              {/* Yellow outline star doodle above the speech bubble */}
                              <svg viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', top: '-14px', left: '120px', transform: 'rotate(10deg)', fill: 'none', stroke: 'var(--color-accent)', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                <path d="M12,2 L15,9 L22,9 L17,14 L19,21 L12,17 L5,21 L7,14 L2,9 L9,9 Z" />
                              </svg>

                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: '1.4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                <strong style={{ color: 'var(--color-primary)', fontFamily: "'Fredoka', sans-serif", fontSize: '12px' }}>Vigi: </strong>
                                {getVigiMessage()}
                              </span>
                              {/* Little tail pointing towards Vigi */}
                              <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '-8px',
                                width: '12px',
                                height: '12px',
                                background: '#ffffff',
                                borderRight: '1.5px solid rgba(18, 27, 51, 0.08)',
                                borderBottom: '1.5px solid rgba(18, 27, 51, 0.08)',
                                transform: 'rotate(-45deg)',
                                zIndex: 1
                              }}></div>
                            </div>

                            {/* The 3D Canvas mascot wrapper */}
                            <div style={{ zIndex: 2, position: 'relative', width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ThreeMascot />
                            </div>

                            {/* Potted Plant Accessory */}
                            <div style={{ position: 'absolute', bottom: '25px', right: '0px', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                              <svg viewBox="0 0 40 50" width="40" height="50" style={{ overflow: 'visible' }}>
                                {/* Terracotta Pot */}
                                <path d="M10,32 L30,32 L26,50 L14,50 Z" fill="#E07A5F" stroke="var(--text-primary)" strokeWidth="1.8" />
                                <rect x="8" y="27" width="24" height="6" rx="2" fill="#F4F1DE" stroke="var(--text-primary)" strokeWidth="1.8" />
                                {/* Green Leaves */}
                                <path d="M20,27 C15,10 12,20 10,12 C8,22 15,22 20,27 Z" fill="#47C1A3" stroke="var(--text-primary)" strokeWidth="1.5" />
                                <path d="M20,27 C25,10 28,20 30,12 C32,22 25,22 20,27 Z" fill="#47C1A3" stroke="var(--text-primary)" strokeWidth="1.5" />
                                <path d="M20,27 C20,5 18,15 17,8 C23,12 21,22 20,27 Z" fill="#2E8B57" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.8" />
                              </svg>
                            </div>

                            {/* Coffee Mug Accessory */}
                            <div style={{ position: 'absolute', bottom: '15px', right: '50px', zIndex: 3, pointerEvents: 'none' }}>
                              <div style={{
                                background: 'var(--color-secondary)',
                                border: '1.5px solid rgba(18, 27, 51, 0.15)',
                                borderRadius: '8px 8px 12px 12px',
                                width: '74px',
                                height: '56px',
                                padding: '4px 6px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                boxShadow: '0 4px 10px rgba(18, 27, 51, 0.04)'
                              }}>
                                {/* Handle */}
                                <div style={{
                                  position: 'absolute',
                                  right: '-10px',
                                  top: '12px',
                                  width: '10px',
                                  height: '24px',
                                  border: '1.5px solid rgba(18, 27, 51, 0.15)',
                                  borderLeft: 'none',
                                  borderRadius: '0 8px 8px 0',
                                  background: 'var(--color-secondary)'
                                }}></div>
                                {/* Text inside Mug */}
                                <span style={{ fontSize: '7px', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', lineHeight: '1.2' }}>Good Ideas Loading</span>
                                {/* Progress bar inside Mug */}
                                <div style={{ width: '48px', height: '6px', background: 'rgba(255,255,255,0.2)', border: '1.2px solid rgba(18, 27, 51, 0.15)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                                  <div style={{ width: '65%', height: '100%', background: '#F2CC8F' }}></div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                  </div>

                </div>

                {/* Redesigned Bottom Feature Cards Row & Sticky Note - Spans full width */}
                <div style={{ 
                  display: 'flex', 
                  gap: '24px', 
                  width: '100%', 
                  marginTop: '16px', 
                  position: 'relative',
                  background: '#ffffff',
                  border: '1px solid rgba(18, 27, 51, 0.06)',
                  borderRadius: '20px',
                  padding: '18px 24px',
                  boxShadow: '0 16px 36px rgba(18, 27, 51, 0.04)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  boxSizing: 'border-box',
                  zIndex: 2
                }}>
                  
                  {/* Card 1: AI-Powered Creativity */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 200px', minWidth: '160px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: '#FFD700', 
                      color: 'var(--text-primary)', 
                      border: 'none',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(255, 215, 0, 0.25)',
                      flexShrink: 0 
                    }}>
                      <Sparkles size={18} fill="currentColor" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fredoka', sans-serif" }}>AI-Powered Creativity</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Smart AI that understands what gets more clicks.</span>
                    </div>
                  </div>

                  {/* Divider 1 */}
                  {isDesktop && <div style={{ width: '0px', height: '40px', borderLeft: '2px dotted var(--text-muted)', opacity: 0.5, flexShrink: 0 }}></div>}

                  {/* Card 2: Performance Focused */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 200px', minWidth: '160px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: '#7E5BFA', 
                      color: '#ffffff', 
                      border: 'none',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(126, 91, 250, 0.25)',
                      flexShrink: 0 
                    }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L17.5 5.5c.75-.75.75-2 0-2.75s-2-.75-2.75 0z" />
                        <path d="M12 9l3 3" />
                        <path d="M9 15l-3-3" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fredoka', sans-serif" }}>Performance Focused</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Built to maximize CTR and audience engagement.</span>
                    </div>
                  </div>

                  {/* Divider 2 */}
                  {isDesktop && <div style={{ width: '0px', height: '40px', borderLeft: '2px dotted var(--text-muted)', opacity: 0.5, flexShrink: 0 }}></div>}

                  {/* Card 3: Secure & Serverless */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1 1 200px', minWidth: '160px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: '#FF5B37', 
                      color: '#ffffff', 
                      border: 'none',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(255, 91, 55, 0.25)',
                      flexShrink: 0 
                    }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fredoka', sans-serif" }}>Secure & Serverless</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Your data is protected and never stored.</span>
                    </div>
                  </div>

                  {/* Divider 3 */}
                  {isDesktop && <div style={{ width: '0px', height: '40px', borderLeft: '2px dotted var(--text-muted)', opacity: 0.5, flexShrink: 0 }}></div>}

                  {/* Lavender sticky note with diagonal yellow tape */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    width: '190px', 
                    height: '42px', 
                    position: 'relative', 
                    flexShrink: 0,
                    marginTop: isDesktop ? '0' : '20px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-32px',
                      width: '190px',
                      background: '#eae6ff',
                      border: '1.5px solid rgba(126, 91, 250, 0.3)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      transform: 'rotate(2.5deg)',
                      boxShadow: '0 8px 24px rgba(126, 91, 250, 0.12)',
                      zIndex: 10
                    }}>
                      <div className="tape-strip-yellow-tr"></div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <p style={{
                          fontFamily: "'Fredoka', sans-serif",
                          fontSize: '11.5px',
                          fontWeight: 800,
                          color: 'var(--color-secondary)',
                          margin: 0,
                          lineHeight: '1.3',
                          textAlign: 'center'
                        }}>
                          Let's make something awesome!
                        </p>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </section>

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

            {activeTab === 'roast' && (
              <div style={styles.mainCard}>
                <div style={styles.roastContainer}>

                  {isGenerating ? (
                    /* AI Analyzing Loading State */
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
                        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Synthesizing Layout Visuals...
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
                          Applying Niche Color Rim Lighting and Text-Safe Negatives for extreme scroll-stopping layouts.
                        </p>
                      </div>
                      
                      <div style={{ width: '220px', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div className="shimmer" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}></div>
                      </div>
                    </div>
                  ) : !imageUrl ? (
                    /* Empty State */
                    <div className="card-glass flex-center" style={{ flex: 1, minHeight: '400px', flexDirection: 'column', gap: '24px', padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #ffffff 0%, rgba(99, 102, 241, 0.01) 100%)', border: '1px dashed rgba(99, 102, 241, 0.25)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={32} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Workspace is Empty
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
                          No visual thumbnail asset is loaded in the workspace. Describe video concepts on the dashboard to generate layout elements.
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
                      </div>
                    </div>
                  ) : (
                    /* Standard Success State - Beautiful Centered Layout */
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '8px' }}>
                      <div style={{ width: '100%', maxWidth: '640px' }}>
                        <Gallery 
                          imageUrl={imageUrl} 
                          isGenerating={isGenerating} 
                          onAnalyze={() => {}}
                          originalImageUrl={originalImageUrl}
                          provider={provider}
                          isOptimized={isOptimized}
                          aspectRatio={aspectRatio}
                          title={inputs.title}
                          onSaveToLibrary={handleSaveToLibrary}
                          isSaved={isSaved}
                        />
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

                  <div style={{ ...styles.upgradeFlexGrid, minHeight: 'auto', alignItems: 'start' }}>
                    
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
                            <Eye size={14} />
                            View Thumbnail Blueprint
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

                  <div style={{ ...styles.titlesFlexGrid, minHeight: 'auto', alignItems: 'start' }}>
                    
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
                  <div style={{ ...styles.analyticsFlexGrid, minHeight: 'auto', alignItems: 'start' }}>
                    
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

        {/* 4. REDESIGNED FOOTER */}
        <footer style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(18, 27, 51, 0.06)',
          background: 'transparent',
          zIndex: 5,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              &copy; {new Date().getFullYear()} Vignette.ai &bull; AI-Powered YouTube Thumbnail Generator & CTR Optimizer. All rights reserved.
              {/* Heart doodle outline SVG */}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginLeft: '2px' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid rgba(18, 27, 51, 0.08)',
              borderRadius: '999px',
              padding: '4px 12px',
              boxShadow: '0 2px 6px rgba(18, 27, 51, 0.02)',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#47C1A3',
                display: 'inline-block'
              }}></span>
              <span style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>Serverless Active</span>
            </div>
          </div>

          {/* Orange loop doodle at the footer center */}
          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            pointerEvents: 'none', 
            opacity: 0.8 
          }}>
            <svg viewBox="0 0 60 20" width="40" height="15" fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5,10 C20,3 25,17 35,10 C45,3 50,17 55,10" />
            </svg>
          </div>
        </footer>
      </div>

      {/* 3. MOBILE RESPONSIVE BOTTOM NAVIGATION SYSTEM */}
      {isMobile && (
        <nav style={styles.mobileBottomNav}>
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'simulator' && activeTab === 'roast');
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
          fontFamily: "'Fredoka', sans-serif",
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
    maxWidth: 'none',
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'var(--color-secondary)',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 18px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(122, 90, 248, 0.2)',
    transition: 'all var(--transition-fast)',
  },
  creditsBadge: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: '#FFF0E0',
    border: '1.5px solid #FFDAB9',
    borderRadius: '20px',
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(255, 178, 107, 0.1)',
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
    maxWidth: 'none',
    margin: '0',
    padding: '0',
    overflow: 'hidden',
  },
  sidebar: {
    width: '240px',
    height: '100vh',
    background: '#FCF8F2',
    borderRight: '2px solid var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: '8px',
    paddingBottom: '16px',
    flexShrink: 0,
    margin: '0',
    position: 'relative',
    overflowY: 'auto',
  },
  proTipCard: {
    background: '#FFF8F0',
    border: '1.5px solid #FFDAB9',
    borderRadius: '16px',
    padding: '14px',
    margin: 'auto 16px 16px 16px',
    width: 'calc(100% - 32px)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 4px 12px rgba(255, 178, 107, 0.06)',
    textAlign: 'left'
  },
  proTipTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--color-primary)',
    margin: 0,
  },
  proTipText: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0,
  },
  proTipStar: {
    position: 'absolute',
    top: '-10px',
    right: '12px',
    transform: 'rotate(15deg)',
  },
  proTipSquiggle: {
    marginTop: '4px',
    alignSelf: 'center',
  },
  workspace: {
    flex: 1,
    margin: '0 24px 24px 24px',
    padding: '24px 32px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minHeight: 0,
  },

  mainCard: {
    background: 'transparent',
    border: 'none',
    borderRadius: 'none',
    boxShadow: 'none',
    padding: '0',
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  },
  makerSubmitBtn: {
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    maxWidth: '600px',
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statsTitle: {
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
  },
  chartGroupLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
  }
};

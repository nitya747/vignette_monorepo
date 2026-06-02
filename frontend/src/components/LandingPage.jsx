'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Eye, 
  UploadCloud, 
  TextQuote, 
  FolderClosed, 
  ChevronRight, 
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  Tv
} from 'lucide-react';
import ThreeMascot from './ThreeMascot';

export default function LandingPage({ 
  user, 
  onStartCreating, 
  setIsAuthOpen, 
  setActiveTab 
}) {
  const [quickPrompt, setQuickPrompt] = useState('');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onStartCreating(quickPrompt);
  };

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const featureCards = [
    {
      icon: Sparkles,
      title: "AI Thumbnail Director",
      desc: "Instantly generate scroll-stopping, high-impact thumbnails and custom visual layouts using advanced DALL-E 3 text-safe rimlighting styles.",
      color: "var(--color-primary)",
      badge: "AI Powered"
    },
    {
      icon: Eye,
      title: "Feed Preview Simulator",
      desc: "Instantly preview and test exactly how your layouts stand out against competitors in smartphone feeds, home pages, and compressed search ranks.",
      color: "var(--color-cyan)",
      badge: "Feed Preview"
    },
    {
      icon: FolderClosed,
      title: "Projects Library",
      desc: "Save and manage your generated visual layouts in a personal gallery, allowing you to instantly restore and iterate on past designs.",
      color: "var(--color-gold)",
      badge: "Save & Manage"
    }
  ];

  return (
    <div style={styles.landingWrapper}>
      {/* Background Tech Dot Grid & Decorative Elements */}
      <div className="tech-dot-grid" style={styles.backgroundGrid} />
      
      {/* Decorative Blur Spheres */}
      <div style={styles.glowSphere1} />
      <div style={styles.glowSphere2} />
      <div style={styles.glowSphere3} />

      {/* 1. MARKETING STICKY HEADER NAVBAR */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo Branding */}
          <div style={styles.logoGroup} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={styles.logoIcon}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22C2 22 8 20 12 16C16 12 22 6 22 2C22 2 16 2 12 6C8 10 2 16 2 22Z"></path>
                <path d="M12 6L18 12"></path>
                <path d="M8 10L14 16"></path>
              </svg>
            </div>
            <span style={styles.logoText}>vignette.ai</span>
          </div>

          {/* Navigation Links */}
          <nav style={styles.nav}>
            <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} style={styles.navLink}>Features</a>
            <a href="#workflow" onClick={(e) => handleScrollTo(e, 'workflow')} style={styles.navLink}>Workflow</a>
            <a href="#pricing" onClick={(e) => handleScrollTo(e, 'pricing')} style={styles.navLink}>Pricing</a>
          </nav>

          {/* Right Side Call To Actions */}
          <div style={styles.headerActions}>
            {user ? (
              <button 
                onClick={() => onStartCreating('')}
                className="btn btn-primary"
                style={styles.goToAppBtn}
              >
                Go to Dashboard
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  style={styles.signInLink}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onStartCreating('')}
                  className="btn btn-primary"
                  style={styles.getStartedBtn}
                >
                  Start Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={styles.heroSection}>
        <div className="hero-container" style={styles.heroContainer}>
          {/* Left Column: Value Prop & Interactive Quick Start */}
          <div style={styles.heroLeft}>
            {/* Launch Badge */}
            <div style={styles.launchBadge}>
              <Sparkles size={12} color="var(--color-primary)" />
              <span style={styles.launchBadgeText}>Next-Gen Visual Intelligence</span>
            </div>

            {/* Radiant H1 Headline */}
            <h1 style={styles.heroTitle}>
              Imagine AI as your<br />
              <span className="pixel-accent-headline" style={styles.titleGradientText}>
                Thumbnail Director.
              </span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.4', fontFamily: "'Inter', sans-serif" }}>
                Predict visual performance, audit safe-zones, and unlock +18% higher click-through rates.
              </span>
            </h1>

            {/* Capture microcopy */}
            <p style={styles.heroDescription}>
              Stop guessing what drives clicks. Vignette scans layout structures, audits safe-zones, and optimizes visual hierarchy in real-time to generate ultra-high CTR assets.
            </p>

            {/* Quick Start Prompt Box (seamless transition) */}
            <form onSubmit={handleQuickSubmit} className="card-glass" style={styles.quickPromptCard}>
              <div style={styles.quickPromptInputGroup}>
                <Sparkles size={16} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
                <input 
                  type="text" 
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Enter video topic or idea (e.g. lofi driving)..."
                  style={styles.quickPromptInput}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={styles.quickSubmitBtn}
                >
                  Generate Concepts
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {/* Dynamic Social Proof */}
            <div style={styles.socialProof}>
              <div style={styles.avatarsGroup}>
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80',
                  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=80&h=80'].map((src, i) => (
                  <img key={i} src={src} alt="Creator" style={{ ...styles.proofAvatar, marginLeft: i > 0 ? '-10px' : '0' }} />
                ))}
              </div>
              <span style={styles.socialProofText}>
                Trusted by <strong>1,200+ content creators</strong> and digital media teams.
              </span>
            </div>
          </div>

          {/* Right Column: 3D Mascot Canvas & Speech Bubble */}
          <div style={styles.heroRight}>
            {/* Interactive floating dialogue */}
            <div className="floating-speech-bubble float-subtle" style={styles.speechBubble}>
              <span style={styles.speechText}>
                <strong style={{ color: 'var(--color-primary)' }}>Vigi:</strong> "Give me your video headline, and I will scan boundaries, test legibility, and render maximum click retention!"
              </span>
              <div style={styles.speechTail} />
            </div>

            <div style={styles.mascotWrapper}>
              <ThreeMascot />
            </div>

            {/* Floating Product Proof Card */}
            <div className="card-glass float-slow" style={styles.proofCard}>
              <div style={styles.proofCardHeader}>
                <div style={styles.proofBadge}>
                  <Sparkles size={10} color="#ffffff" style={{ strokeWidth: 3 }} />
                  <span>Optimized</span>
                </div>
                <span style={styles.proofCtr}>CTR +18.4%</span>
              </div>
              <div style={styles.proofCardBody}>
                <div style={styles.proofRow}>
                  <CheckCircle2 size={12} color="var(--color-success)" style={{ strokeWidth: 3 }} />
                  <span style={styles.proofLabel}>Contrast Audit:</span>
                  <strong style={styles.proofValue}>7.4:1 (Pass)</strong>
                </div>
                <div style={styles.proofRow}>
                  <CheckCircle2 size={12} color="var(--color-success)" style={{ strokeWidth: 3 }} />
                  <span style={styles.proofLabel}>Safe-Zones:</span>
                  <strong style={styles.proofValue}>100% Clear</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-PLATFORM SAFE-ZONE MATRIX & CTR PRESETS */}
      <section style={styles.platformSection}>
        <div style={styles.platformContainer}>
          <div style={styles.platformHeader}>
            <div style={styles.platformBadge}>
              <Layers size={12} color="var(--color-primary)" />
              <span style={styles.platformBadgeText}>Multi-Platform Standard</span>
            </div>
            <h2 style={styles.platformTitle}>Safe-Zone & CTR Calibration Suite</h2>
            <p style={styles.platformSubtitle}>
              One workspace. Tailored aspect ratios, auto-injected native interface overlays, and dynamic legibility safeties for every digital feed.
            </p>
          </div>

          <div style={styles.platformGrid}>
            {/* Card 1: YouTube */}
            <div className="card-glass platform-card" style={styles.platformCard}>
              <div className="platform-card-glow" style={{ ...styles.platformCardGlow, background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)' }} />
              <div style={styles.platformCardHeader}>
                <div style={{ ...styles.platformIconBox, background: 'rgba(239, 68, 68, 0.08)' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.29 29 29 0 0 0-.46-5.33z" fill="#ef4444" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff" />
                  </svg>
                </div>
                <div style={styles.platformMeta}>
                  <span style={styles.platformName}>YouTube Feed</span>
                  <span style={styles.platformRatio}>16:9 Landscape</span>
                </div>
              </div>
              <div style={styles.platformCardBody}>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-primary)" />
                  <span>Time-Badge Obstruct Protection</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-primary)" />
                  <span>Sidebar Overlay Mock Simulation</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-primary)" />
                  <span>Mobile Feed Legibility Roast</span>
                </div>
              </div>
            </div>

            {/* Card 2: TikTok */}
            <div className="card-glass platform-card" style={styles.platformCard}>
              <div className="platform-card-glow" style={{ ...styles.platformCardGlow, background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)' }} />
              <div style={styles.platformCardHeader}>
                <div style={{ ...styles.platformIconBox, background: 'rgba(6, 182, 212, 0.08)' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="var(--color-cyan)" />
                  </svg>
                </div>
                <div style={styles.platformMeta}>
                  <span style={styles.platformName}>TikTok Cover</span>
                  <span style={styles.platformRatio}>9:16 Portrait</span>
                </div>
              </div>
              <div style={styles.platformCardBody}>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-cyan)" />
                  <span>Bottom Caption Safe-Zone Alignment</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-cyan)" />
                  <span>Right-Side Interaction Blockers Scan</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-cyan)" />
                  <span>Ultra-Contrast Vertical Heatmap</span>
                </div>
              </div>
            </div>

            {/* Card 3: Twitch */}
            <div className="card-glass platform-card" style={styles.platformCard}>
              <div className="platform-card-glow" style={{ ...styles.platformCardGlow, background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)' }} />
              <div style={styles.platformCardHeader}>
                <div style={{ ...styles.platformIconBox, background: 'rgba(168, 85, 247, 0.08)' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9H9V6h2v5zm4 0h-2V6h2v5z" fill="#a855f7" />
                  </svg>
                </div>
                <div style={styles.platformMeta}>
                  <span style={styles.platformName}>Twitch Stream</span>
                  <span style={styles.platformRatio}>16:9 Broadcast</span>
                </div>
              </div>
              <div style={styles.platformCardBody}>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-accent)" />
                  <span>Live Stream Directory Standout Roast</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-accent)" />
                  <span>Dynamic Resolution Clutter Scan</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="var(--color-accent)" />
                  <span>Badge & Viewer-Count Masking</span>
                </div>
              </div>
            </div>

            {/* Card 4: YouTube Shorts */}
            <div className="card-glass platform-card" style={styles.platformCard}>
              <div className="platform-card-glow" style={{ ...styles.platformCardGlow, background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)' }} />
              <div style={styles.platformCardHeader}>
                <div style={{ ...styles.platformIconBox, background: 'rgba(239, 68, 68, 0.08)' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="2" width="12" height="20" rx="3" fill="none" />
                    <polygon points="10 9 15 12 10 15 10 9" fill="#ef4444" />
                  </svg>
                </div>
                <div style={styles.platformMeta}>
                  <span style={styles.platformName}>YouTube Shorts</span>
                  <span style={styles.platformRatio}>9:16 Vertical Portrait</span>
                </div>
              </div>
              <div style={styles.platformCardBody}>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="#ef4444" />
                  <span>Right-Side Buttons Safe-Zone Overlay</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="#ef4444" />
                  <span>Caption and Sound Badge Clutter Scan</span>
                </div>
                <div style={styles.platformFeatureItem}>
                  <CheckCircle2 size={12} color="#ef4444" />
                  <span>Shorts Feed Standout Calibration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 4. PRODUCT FEATURE GRID (Bento Grid) */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>Complete Suite</span>
          <h2 style={styles.sectionTitle}>Engineered for High-Retention Hooks</h2>
          <p style={styles.sectionSubtitle}>
            Vignette packages state-of-the-art AI image composition controls and legibility audit simulators into one beautifully streamlined workspace.
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="card-glass" style={styles.featureCard}>
                <div style={styles.cardGlowBorder} />
                <div style={{ ...styles.featureIconBox, background: `${feat.color}15`, color: feat.color }}>
                  <Icon size={24} />
                </div>
                <div style={styles.featureBadge}>{feat.badge}</div>
                <h3 style={styles.featureTitle}>{feat.title}</h3>
                <p style={styles.featureDesc}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>



      {/* 6. HOW IT WORKS SECTION */}
      <section id="workflow" style={styles.workflowSection}>
        <div style={styles.workflowHeader}>
          <span style={styles.sectionBadge}>Simple Workflow</span>
          <h2 style={styles.sectionTitle}>Three Steps to Maximum Clickability</h2>
          <p style={styles.sectionSubtitle}>
            Vignette matches advanced artificial intelligence with highly specific human behavioral algorithms.
          </p>
        </div>

        <div style={styles.stepsContainer}>
          {[
            {
              num: "1",
              title: "Enter Topic & Keywords",
              desc: "Type in your core topic idea directly into the generator bar to define your concept."
            },
            {
              num: "2",
              title: "Choose Click Archetype",
              desc: "Select a behavioral trigger like 'Burning Question', 'Extreme Emotion', or 'Versus Split' to structurally direct the composition."
            },
            {
              num: "3",
              title: "Preview & Export Layouts",
              desc: "Verify layouts inside responsive mobile preview devices, and save or export your premium thumbnail designs."
            }
          ].map((step, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={styles.stepNumberBox}>
                <span style={styles.stepNumberText}>{step.num}</span>
                {i < 2 && <div className="step-connector-line" style={styles.stepConnectorLine} />}
              </div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PREMIUM PRICING PLANS */}
      <section id="pricing" style={styles.pricingSection}>
        <div style={styles.pricingHeader}>
          <span style={styles.sectionBadge} className="badge-accent">Simple Pricing</span>
          <h2 style={styles.sectionTitle}>Scale Your CTR Retention</h2>
          <p style={styles.sectionSubtitle}>
            Unlock next-generation image generation models, detailed safe-zone audits, and unlimited performance logging.
          </p>
        </div>

        <div style={styles.pricingGrid}>
          {/* Free Tier */}
          <div className="card-glass" style={styles.pricingCard}>
            <span style={styles.pricingPlanName}>Starter Plan</span>
            <div style={styles.priceContainer}>
              <span style={styles.priceSymbol}>$</span>
              <span style={styles.priceValue}>0</span>
              <span style={styles.pricePeriod}>/month</span>
            </div>
            <p style={styles.pricingPlanDesc}>Perfect for exploring AI visual directions and basic feed audits.</p>
            
            <div style={styles.pricingDivider} />
            
            <ul style={styles.pricingFeaturesList}>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span>3 AI Thumbnail generations / day</span>
              </li>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span>Standard 16:9 feed preview simulator</span>
              </li>
            </ul>

            <button 
              onClick={() => onStartCreating('')}
              className="btn btn-secondary" 
              style={styles.pricingCTA}
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="card-glass" style={{ ...styles.pricingCard, border: '2px solid var(--color-primary)', position: 'relative' }}>
            <div style={styles.popularBadge}>Most Popular</div>
            <span style={{ ...styles.pricingPlanName, color: 'var(--color-primary)' }}>Vignette Pro</span>
            <div style={styles.priceContainer}>
              <span style={styles.priceSymbol}>$</span>
              <span style={styles.priceValue}>19</span>
              <span style={styles.pricePeriod}>/month</span>
            </div>
            <p style={styles.pricingPlanDesc}>Unlock the complete visual suite to consistently dominate mobile feeds.</p>

            <div style={styles.pricingDivider} />

            <ul style={styles.pricingFeaturesList}>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 600 }}>Unlimited premium AI generations</span>
              </li>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 600 }}>Multi-platform aspect-ratio layouts</span>
              </li>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span>Multi-format support (YouTube Shorts 9:16)</span>
              </li>
              <li style={styles.pricingFeatureItem}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                <span>Save to cloud project library</span>
              </li>
            </ul>

            <button 
              onClick={() => onStartCreating('')}
              className="btn btn-primary" 
              style={styles.pricingCTA}
            >
              Go Pro Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. BOTTOM FINAL CALL TO ACTION */}
      <section style={styles.bottomCtaSection}>
        <div className="card-glass" style={styles.ctaCard}>
          <div style={styles.ctaInnerGlow} />
          <h2 style={styles.ctaCardTitle}>Ready to double your click-through rates?</h2>
          <p style={styles.ctaCardSubtitle}>
            Join thousands of modern creators mapping visual composition weights with artificial intelligence.
          </p>
          <button 
            onClick={() => onStartCreating('')}
            className="btn btn-primary"
            style={styles.ctaCardBtn}
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 9. MARKETING FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerInfo}>
            <div style={styles.logoGroup}>
              <div style={styles.logoIcon}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22C2 22 8 20 12 16C16 12 22 6 22 2C22 2 16 2 12 6C8 10 2 16 2 22Z"></path>
                  <path d="M12 6L18 12"></path>
                  <path d="M8 10L14 16"></path>
                </svg>
              </div>
              <span style={styles.logoText}>vignette.ai</span>
            </div>
            <p style={styles.footerDesc}>Next-generation thumbnail directing engine powered by visual composition intelligence.</p>
          </div>
          
          <div style={styles.footerBottom}>
            <span style={styles.copyright}>© 2026 Vignette.ai. All rights reserved.</span>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Terms of Service</a>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  landingWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-base)',
    position: 'relative',
    overflowX: 'hidden',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif"
  },
  backgroundGrid: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none'
  },
  glowSphere1: {
    position: 'absolute',
    top: '-150px',
    right: '-100px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowSphere2: {
    position: 'absolute',
    top: '600px',
    left: '-200px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowSphere3: {
    position: 'absolute',
    bottom: '200px',
    right: '-200px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
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
    maxWidth: '1200px',
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
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color var(--transition-fast)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  signInLink: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'color 0.2s',
  },
  getStartedBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 18px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--color-primary)',
    color: '#ffffff',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
  },
  goToAppBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 18px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--color-primary)',
    color: '#ffffff',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  heroSection: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 24px',
    width: '100%',
  },
  heroContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '64px',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'left'
  },
  launchBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--color-primary-glow)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '20px',
    padding: '6px 14px',
  },
  launchBadgeText: {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'var(--color-primary)',
    letterSpacing: '0.05em',
    fontFamily: "'Outfit', sans-serif"
  },
  heroTitle: {
    fontSize: 'clamp(38px, 6vw, 56px)',
    fontWeight: 900,
    color: 'var(--text-primary)',
    lineHeight: '1.1',
    letterSpacing: '-0.03em',
  },
  titleGradientText: {
    backgroundImage: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)'
  },
  heroDescription: {
    fontSize: '17px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '560px',
  },
  quickPromptCard: {
    padding: '10px 12px',
    borderRadius: '16px',
    border: '1px solid rgba(99, 102, 241, 0.18)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 16px 40px rgba(99, 102, 241, 0.08)',
    width: '100%',
    maxWidth: '620px',
    position: 'relative',
    zIndex: 10
  },
  quickPromptInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%'
  },
  quickPromptInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', sans-serif",
    padding: '8px 4px'
  },
  quickSubmitBtn: {
    background: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  socialProof: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '8px'
  },
  avatarsGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  proofAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
    objectFit: 'cover'
  },
  socialProofText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  heroRight: {
    flex: 0.9,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '420px',
  },
  speechBubble: {
    position: 'absolute',
    top: '0px',
    left: '-20px',
    zIndex: 10,
    background: 'rgba(239, 241, 249, 0.92)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: '20px 20px 4px 20px',
    padding: '14px 18px',
    maxWidth: '240px',
    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.06)',
    pointerEvents: 'none',
  },
  speechText: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'block',
    lineHeight: '1.4',
    fontFamily: "'Inter', sans-serif"
  },
  speechTail: {
    position: 'absolute',
    bottom: '12px',
    right: '-8px',
    width: '16px',
    height: '16px',
    background: '#eff1f9',
    borderRight: '1px solid rgba(99, 102, 241, 0.12)',
    borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
    transform: 'rotate(-45deg)',
    zIndex: -1
  },
  mascotWrapper: {
    zIndex: 2,
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '40px auto 20px auto',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  platformContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },
  platformHeader: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  platformBadge: {
    display: 'inline-flex',
    alignSelf: 'center',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--color-primary-glow)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '20px',
    padding: '4px 10px'
  },
  platformBadgeText: {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'var(--color-primary)',
    letterSpacing: '0.05em',
    fontFamily: "'Outfit', sans-serif"
  },
  platformTitle: {
    fontSize: 'clamp(24px, 3.5vw, 36px)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  platformSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  platformCard: {
    position: 'relative',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    borderRadius: '20px',
    cursor: 'pointer'
  },
  platformCardGlow: {
    position: 'absolute',
    top: '-40px',
    right: '-40px',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  platformCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    zIndex: 1
  },
  platformIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
  },
  platformMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  platformName: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  },
  platformRatio: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)'
  },
  platformCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 1
  },
  platformFeatureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  featuresSection: {
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto 60px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  sectionBadge: {
    display: 'inline-flex',
    background: 'var(--color-primary-glow)',
    color: 'var(--color-primary)',
    fontSize: '11px',
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: "'Outfit', sans-serif"
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: '1.2'
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  featureCard: {
    position: 'relative',
    padding: '30px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.06)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  featureIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  featureBadge: {
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  featureDesc: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  showcaseSection: {
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '32px',
    width: '100%',
    marginTop: '20px'
  },
  comparisonCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#ffffff'
  },
  cardHeaderStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  scoreBadge: {
    fontSize: '11px',
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: '20px',
  },
  nicheBadge: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-secondary)'
  },
  previewImageContainer: {
    position: 'relative',
    aspectRatio: '16/9',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  errorOverlayContainer: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(239, 68, 68, 0.05)',
    pointerEvents: 'none'
  },
  successOverlayContainer: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(16, 185, 129, 0.02)',
    pointerEvents: 'none'
  },
  timeBadgeFake: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.85)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: '4px',
    fontFamily: 'sans-serif'
  },
  legibilityWarning: {
    position: 'absolute',
    background: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  legibilitySuccess: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(16, 185, 129, 0.95)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  focalPointHighlight: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    background: 'rgba(99, 102, 241, 0.85)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 800,
    padding: '6px 12px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
  },
  safeZoneOverlayBorder: {
    position: 'absolute',
    inset: '10px',
    border: '2px dashed rgba(99, 102, 241, 0.4)',
    borderRadius: '8px'
  },
  cardCritiqueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border-subtle)'
  },
  critiqueListTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '2px'
  },
  critiqueItem: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '1.4'
  },
  workflowHeader: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto 28px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  workflowSection: {
    padding: '48px 32px',
    maxWidth: '1200px',
    margin: '80px auto 80px auto',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '30px',
    border: '1px solid var(--border-subtle)',
    position: 'relative',
    zIndex: 1
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    width: '100%',
    marginTop: '24px'
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'center',
    alignItems: 'center'
  },
  stepNumberBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
    position: 'relative',
    marginBottom: '8px'
  },
  stepNumberText: {
    fontSize: '15px',
    fontWeight: 900,
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif"
  },
  stepConnectorLine: {
    position: 'absolute',
    top: '20px',
    left: '40px',
    width: '280px',
    height: '2px',
    background: 'rgba(99,102,241,0.15)',
    zIndex: -1
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  stepDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '280px'
  },
  pricingHeader: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto 28px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  pricingSection: {
    padding: '48px 24px',
    maxWidth: '1000px',
    margin: '80px auto',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    width: '100%',
    alignItems: 'stretch',
    marginTop: '24px'
  },
  pricingCard: {
    padding: '32px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#ffffff',
    borderRadius: '24px'
  },
  pricingPlanName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline'
  },
  priceSymbol: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif"
  },
  priceValue: {
    fontSize: '44px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    lineHeight: '1'
  },
  pricePeriod: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  pricingPlanDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  pricingDivider: {
    height: '1px',
    background: 'var(--border-subtle)',
    margin: '8px 0'
  },
  pricingFeaturesList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: 0
  },
  pricingFeatureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  pricingCTA: {
    marginTop: '10px',
    width: '100%',
    padding: '11px 0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  popularBadge: {
    position: 'absolute',
    top: '18px',
    right: '24px',
    background: 'var(--color-primary-glow)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: 'var(--color-primary)',
    fontSize: '9px',
    fontWeight: 900,
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.05em'
  },
  bottomCtaSection: {
    padding: '60px 24px 120px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
    zIndex: 1
  },
  ctaCard: {
    padding: '60px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.06) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    overflow: 'hidden',
    position: 'relative'
  },
  ctaInnerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  ctaCardTitle: {
    fontSize: 'clamp(24px, 3.5vw, 36px)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    zIndex: 1
  },
  ctaCardSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '560px',
    zIndex: 1
  },
  ctaCardBtn: {
    padding: '14px 32px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.25)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  footer: {
    background: '#0f172a',
    padding: '60px 24px 30px 24px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    color: '#cbd5e1'
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '360px'
  },
  footerDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6'
  },
  footerBottom: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  copyright: {
    fontSize: '12.5px',
    color: '#64748b'
  },
  footerLinks: {
    display: 'flex',
    gap: '20px'
  },
  footerLink: {
    fontSize: '12.5px',
    color: '#64748b',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  proofCard: {
    position: 'absolute',
    bottom: '-15px',
    right: '-15px',
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '14px 18px',
    width: '210px',
    boxShadow: '0 12px 36px rgba(99, 102, 241, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  proofCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  proofBadge: {
    background: 'var(--color-primary)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  proofCtr: {
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--color-success)',
    fontFamily: "'Outfit', sans-serif",
  },
  proofCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  proofRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  proofLabel: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  proofValue: {
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginLeft: 'auto',
  }
};

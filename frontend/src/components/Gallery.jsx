'use strict';

import React, { useState } from 'react';
import { Eye, Download, Edit3, Image as ImageIcon, Sparkles, RefreshCw, Monitor, Tablet, User, ThumbsUp, ThumbsDown, MessageSquare, Share2, CheckCircle2 } from 'lucide-react';

export default function Gallery({ 
  imageUrl, 
  isGenerating, 
  onEdit, 
  onAnalyze, 
  originalImageUrl, 
  provider,
  isOptimized,
  aspectRatio = '16:9',
  title = 'An ambient thumbnail for my lofi playlist'
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [previewScale, setPreviewScale] = useState('desktop'); // 'desktop' or 'mobile'

  if (isGenerating) {
    return (
      <div className="card-glass flex-center shimmer" style={styles.loadingContainer}>
        <div style={styles.loadingInner}>
          <RefreshCw size={28} className="spinner" style={styles.loadingIcon} />
          <h4 style={styles.loadingText}>Synthesizing Layout Visuals...</h4>
          <p style={styles.loadingSub}>Applying Niche Color Rim Lighting and Text-Safe Negatives</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="card-glass flex-center" style={styles.emptyContainer}>
        <div style={styles.emptyInner}>
          <ImageIcon size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h4 style={styles.emptyText}>No Thumbnail Generated Yet</h4>
          <p style={styles.emptySub}>Fill out the context forms and click "Generate Thumbnail Blueprint" above.</p>
        </div>
      </div>
    );
  }

  const activeDisplayUrl = (originalImageUrl && showOriginal) ? originalImageUrl : imageUrl;
  const isShorts = aspectRatio === '9:16';

  return (
    <div className="card-glass" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <h3 style={styles.title}>{isShorts ? 'Generated Shorts Blueprint' : 'Generated Thumbnail Blueprint'}</h3>
          <span className="badge badge-primary">{provider || 'AI Engine'}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Desktop/Mobile preview switcher */}
          <div style={styles.toggleGroup}>
            <button 
              onClick={() => setPreviewScale('desktop')}
              style={{
                ...styles.toggleBtn,
                ...(previewScale === 'desktop' ? styles.toggleActive : {})
              }}
              title="Desktop View"
            >
              <Monitor size={12} />
              Desktop
            </button>
            <button 
              onClick={() => setPreviewScale('mobile')}
              style={{
                ...styles.toggleBtn,
                ...(previewScale === 'mobile' ? styles.toggleActive : {})
              }}
              title="Mobile Device View"
            >
              <Tablet size={12} />
              Mobile
            </button>
          </div>

          {originalImageUrl && (
            <div style={styles.compareToggleGroup}>
              <button 
                onClick={() => setShowOriginal(false)}
                style={{
                  ...styles.compareBtn,
                  ...(!showOriginal ? styles.compareActive : {})
                }}
              >
                AI version
              </button>
              <button 
                onClick={() => setShowOriginal(true)}
                style={{
                  ...styles.compareBtn,
                  ...(showOriginal ? styles.compareActive : {})
                }}
              >
                Original
              </button>
            </div>
          )}
        </div>
      </div>

      {previewScale === 'mobile' ? (
        /* Highly premium CSS-based smartphone frame preview */
        <div style={styles.phoneMockupFrame}>
          <div style={styles.phoneNotch}></div>
          <div style={styles.phoneScreen}>
            
            {/* Status bar mock */}
            <div style={styles.phoneStatusBar}>
              <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: 600 }}>12:30</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="10" height="10" fill="#ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <div style={{ width: '12px', height: '6px', border: '1px solid #ffffff', borderRadius: '1px', background: '#ffffff' }}></div>
              </div>
            </div>

            {isShorts ? (
              /* Youtube Shorts Fullscreen Mobile Mockup */
              <div style={styles.shortsPlayer}>
                <img 
                  src={activeDisplayUrl} 
                  alt="YouTube Shorts Mobile" 
                  style={styles.shortsBgImage}
                />
                
                {/* Visual CTR Roast overlay safety gradient */}
                <div style={styles.shortsVignette}></div>

                {/* Right side interaction buttons */}
                <div style={styles.shortsRightIcons}>
                  <div style={styles.shortsAvatarCircle}>
                    <User size={14} color="#ffffff" />
                    <div style={styles.shortsAvatarPlus}>+</div>
                  </div>
                  
                  <div style={styles.shortsIconGroup}>
                    <div style={styles.shortsIconButton}>
                      <ThumbsUp size={16} color="#ffffff" fill="#ffffff" />
                    </div>
                    <span style={styles.shortsIconText}>14K</span>
                  </div>

                  <div style={styles.shortsIconGroup}>
                    <div style={styles.shortsIconButton}>
                      <ThumbsDown size={16} color="#ffffff" />
                    </div>
                    <span style={styles.shortsIconText}>Dislike</span>
                  </div>

                  <div style={styles.shortsIconGroup}>
                    <div style={styles.shortsIconButton}>
                      <MessageSquare size={16} color="#ffffff" fill="#ffffff" />
                    </div>
                    <span style={styles.shortsIconText}>382</span>
                  </div>

                  <div style={styles.shortsIconGroup}>
                    <div style={styles.shortsIconButton}>
                      <Share2 size={16} color="#ffffff" fill="#ffffff" style={{ transform: 'scaleX(-1)' }} />
                    </div>
                    <span style={styles.shortsIconText}>Share</span>
                  </div>

                  {/* Rotating spinning vinyl record */}
                  <div className="shorts-vinyl-spin" style={styles.shortsVinyl}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbe0b' }}></div>
                  </div>
                </div>

                {/* Bottom left description */}
                <div style={styles.shortsBottomMeta}>
                  <div style={styles.shortsChannelRow}>
                    <span style={styles.shortsHandle}>@TechVanguard</span>
                    <button style={styles.shortsSubscribeBtn}>Subscribe</button>
                  </div>
                  <p style={styles.shortsTitleText}>{title || 'Cozy Ambient Playlistbeats to relax/study'}</p>
                  <div style={styles.shortsMusicRow}>
                    <span style={{ fontSize: '10px', color: '#ffffff' }}>🎵 original sound - TechVanguard</span>
                  </div>
                </div>

              </div>
            ) : (
              /* Regular 16:9 video mockup inside YouTube Mobile App feed */
              <div style={styles.youtubeAppMock}>
                {/* Mock header */}
                <div style={styles.youtubeHeaderMock}>
                  <span style={styles.ytLogoMock}>▶ YouTube</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '12px' }}>🔍</span>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }}></div>
                  </div>
                </div>

                {/* Feed item */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '8px' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000' }}>
                    <img 
                      src={activeDisplayUrl} 
                      alt="YouTube Mobile Card" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={styles.durationBadgeMobile}>14:32</div>
                  </div>
                  
                  <div style={styles.mobileCardDetails}>
                    <div style={styles.mobileAvatar}>
                      <User size={14} color="#9ca3af" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <h4 style={styles.mobileVideoTitle}>{title || 'Cozy Ambient Playlistbeats to relax/study'}</h4>
                      <div style={styles.mobileChannelRow}>
                        <span>TechVanguard</span>
                        <CheckCircle2 size={10} color="#aaa" />
                        <span style={{ margin: '0 3px' }}>•</span>
                        <span>142K views</span>
                        <span style={{ margin: '0 3px' }}>•</span>
                        <span>2h ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtext info */}
                <div style={styles.mobileAuditNotice}>
                  <Sparkles size={11} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.3' }}>
                    Auditing mobile postage legibility. Snapped text grids remain 100% responsive and readable!
                  </span>
                </div>
              </div>
            )}
            
          </div>
        </div>
      ) : (
        /* Desktop aspect-enforced view */
        <div style={styles.desktopPreviewContainer}>
          <div style={{
            ...styles.imageWrapper,
            aspectRatio: isShorts ? '9/16' : '16/9',
            maxHeight: isShorts ? '450px' : '400px', // Prevent massive card scaling pushing buttons out
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            width: isShorts ? '253px' : '100%' // standard 9:16 width inside landscape bounds
          }}>
            <img 
              src={activeDisplayUrl} 
              alt="Vignette Thumbnail Blueprint" 
              style={styles.image}
            />
            
            {isOptimized && !showOriginal && (
              <div style={styles.optimizedBadge}>
                <Sparkles size={12} />
                Click-Optimized
              </div>
            )}
          </div>

          {/* Premium YouTube-style desktop details block underneath so the video title text is fully visible */}
          <div style={styles.desktopCardDetails}>
            <div style={styles.desktopAvatar}>
              <User size={16} color="var(--text-muted)" />
            </div>
            <div style={styles.desktopTextDetails}>
              <h4 style={styles.desktopVideoTitle}>{title || 'Cozy Ambient Playlistbeats to relax/study'}</h4>
              <div style={styles.desktopChannelRow}>
                <span style={styles.desktopChannelName}>TechVanguard</span>
                <CheckCircle2 size={10} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
                <span style={styles.desktopDot}>•</span>
                <span>142K views</span>
                <span style={styles.desktopDot}>•</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.actionGrid}>
        <button 
          onClick={onAnalyze}
          className="btn btn-secondary"
          style={styles.actionBtn}
        >
          <Eye size={16} color="var(--color-primary)" />
          CTR Vision Critique
        </button>
        
        <button 
          onClick={onEdit}
          className="btn btn-primary"
          style={styles.actionBtn}
        >
          <Edit3 size={16} />
          Edit & Add Text
        </button>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    height: '380px',
    borderRadius: 'var(--radius-lg)',
  },
  loadingInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
  },
  loadingIcon: {
    color: 'var(--color-primary)',
    animation: 'spin 1.2s linear infinite',
  },
  loadingText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  loadingSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  emptyContainer: {
    height: '380px',
    borderRadius: 'var(--radius-lg)',
  },
  emptyInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '280px',
  },
  emptyText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  emptySub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
  },
  toggleGroup: {
    display: 'flex',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '2px',
    gap: '2px',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    padding: '4px 8px',
    border: 'none',
    background: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  toggleActive: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  compareToggleGroup: {
    display: 'flex',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    gap: '2px',
  },
  compareBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    padding: '6px 12px',
    border: 'none',
    background: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  compareActive: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    background: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  optimizedBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, var(--color-accent) 0%, #f43f5e 100%)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: 'var(--radius-full)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  actionBtn: {
    width: '100%',
  },

  /* Beautiful CSS Smartphone frame styles */
  phoneMockupFrame: {
    width: '240px',
    height: '420px',
    border: '8px solid #282828',
    borderRadius: '32px',
    position: 'relative',
    overflow: 'hidden',
    background: '#000000',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  },
  phoneNotch: {
    width: '80px',
    height: '16px',
    background: '#282828',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
  },
  phoneScreen: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '16px',
    position: 'relative',
  },
  phoneStatusBar: {
    height: '18px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 12px',
    alignItems: 'center',
    position: 'absolute',
    top: '4px',
    left: 0,
    zIndex: 99,
  },

  /* YouTube App layout simulator inside phone */
  youtubeAppMock: {
    width: '100%',
    height: '100%',
    background: '#0f0f0f', // YouTube Dark theme
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '6px',
  },
  youtubeHeaderMock: {
    height: '32px',
    width: '100%',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
  },
  ytLogoMock: {
    fontFamily: "'Oswald', Impact, sans-serif",
    color: '#ff0000',
    fontWeight: 900,
    fontSize: '11px',
    letterSpacing: '-0.5px',
  },
  durationBadgeMobile: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 4px',
    borderRadius: '2px',
  },
  mobileCardDetails: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
  },
  mobileAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mobileVideoTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#f1f1f1',
    lineHeight: '1.3',
    maxHeight: '26px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  mobileChannelRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2px',
    fontSize: '8px',
    color: '#aaa',
    marginTop: '1px',
  },
  mobileAuditNotice: {
    margin: 'auto 10px 10px 10px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
  },

  /* Shorts vertical player layout inside phone */
  shortsPlayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    background: '#000000',
  },
  shortsBgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  shortsVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '160px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
    pointerEvents: 'none',
  },
  shortsRightIcons: {
    position: 'absolute',
    bottom: '40px',
    right: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10,
  },
  shortsAvatarCircle: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#ffbe0b',
    border: '1.5px solid #ffffff',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsAvatarPlus: {
    position: 'absolute',
    bottom: '-3px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff0000',
    color: '#ffffff',
    fontSize: '8px',
    fontWeight: 800,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsIconGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  shortsIconButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  shortsIconText: {
    fontSize: '8px',
    color: '#ffffff',
    fontWeight: 600,
  },
  shortsVinyl: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#111111',
    border: '2px solid #333333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsBottomMeta: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    width: 'calc(100% - 60px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 10,
    textAlign: 'left',
  },
  shortsChannelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  shortsHandle: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#ffffff',
  },
  shortsSubscribeBtn: {
    background: '#ff0000',
    color: '#ffffff',
    border: 'none',
    fontSize: '9px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  shortsTitleText: {
    fontSize: '10px',
    color: '#ffffff',
    lineHeight: '1.3',
    fontWeight: 500,
    maxHeight: '26px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  shortsMusicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  desktopPreviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
    margin: '0 auto',
  },
  desktopCardDetails: {
    display: 'flex',
    gap: '12px',
    padding: '12px 4px',
    width: '100%',
  },
  desktopAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  desktopTextDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    textAlign: 'left',
  },
  desktopVideoTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    margin: 0,
  },
  desktopChannelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  desktopChannelName: {
    color: 'var(--text-secondary)',
  },
  desktopDot: {
    margin: '0 4px',
  }
};

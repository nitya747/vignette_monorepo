'use strict';

import React, { useState } from 'react';
import { Play, User, CheckCircle2, Tablet, Monitor, AlignLeft, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react';

export default function YoutubePreview({ imageUrl, title, aspectRatio = '16:9' }) {
  const [feedMode, setFeedMode] = useState('desktop');
  const displayTitle = title && title.length > 70 
    ? (title.substring(0, 67) + '...') 
    : (title || 'I Spent 100 Hours Inside an Autonomous AI Village');
  const isShorts = aspectRatio === '9:16';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            background: 'var(--color-primary-glow)',
            border: '1.5px solid var(--color-primary)',
            color: 'var(--color-primary)',
            padding: '3px 8px',
            borderRadius: '12px',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
            {isShorts ? 'SHORTS MODE' : 'LANDSCAPE MODE'}
          </span>
          <h3 style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontSize: '15px', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            Interactive Viewport Simulator
          </h3>
        </div>
        
        <div style={styles.feedSelector}>
          <button 
            onClick={() => setFeedMode('desktop')}
            style={{
              ...styles.feedBtn,
              ...(feedMode === 'desktop' ? styles.feedBtnActive : {})
            }}
          >
            <Monitor size={12} />
            Desktop Search
          </button>
          
          <button 
            onClick={() => setFeedMode('mobile')}
            style={{
              ...styles.feedBtn,
              ...(feedMode === 'mobile' ? styles.feedBtnActive : {})
            }}
          >
            <Tablet size={12} />
            Mobile Feed
          </button>
        </div>
      </div>

      <div style={styles.feedBox}>
        {/* Floating Precision Tag */}
        <div style={styles.precisionScaleTag}>
          <span style={styles.precisionDot}></span>
          <span>
            {isShorts 
              ? (feedMode === 'desktop' ? 'DESKTOP SHORTS FEED · 210px' : 'MOBILE DEVICE SIMULATOR · 240px')
              : (feedMode === 'desktop' ? 'DESKTOP SEARCH VIEW CARD · 320px' : 'MOBILE DEVICE SIMULATOR · 240px')
            }
          </span>
        </div>

        {isShorts ? (
          /* Shorts Previews (Vertical 9:16 format) */
          feedMode === 'desktop' ? (
            /* Desktop Shorts Mockup inside beautiful Browser Frame */
            <div style={styles.browserFrame}>
              <div style={styles.browserHeader}>
                <div style={styles.browserDots}>
                  <span style={{ ...styles.browserDot, background: '#ff5f56' }}></span>
                  <span style={{ ...styles.browserDot, background: '#ffbd2e' }}></span>
                  <span style={{ ...styles.browserDot, background: '#27c93f' }}></span>
                </div>
                <div style={styles.browserAddressBar}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '4px' }}>🔒</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>youtube.com/shorts</span>
                </div>
                <div style={{ width: '40px' }}></div>
              </div>
              
              <div style={{ ...styles.browserBody, padding: '24px 20px 24px 20px' }}>
                <div style={styles.desktopShortsContainer}>
                  <div style={styles.shortsDesktopFrame}>
                    <img 
                      src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=640'} 
                      alt="Desktop Shorts Card" 
                      style={styles.shortsDesktopImage}
                    />
                    
                    {/* Desktop Play overlay */}
                    <div style={styles.shortsPlayOverlay}>
                      <div style={styles.shortsLogoOverlay}>⚡ SHORTS</div>
                    </div>

                    {/* Right side desk control buttons */}
                    <div style={styles.shortsDesktopControls}>
                      <div style={styles.shortsDeskBtn}><ThumbsUp size={14} color="#fff" /></div>
                      <span style={styles.shortsDeskText}>12K</span>
                      
                      <div style={styles.shortsDeskBtn}><ThumbsDown size={14} color="#fff" /></div>
                      <span style={styles.shortsDeskText}>Dislike</span>
                      
                      <div style={styles.shortsDeskBtn}><MessageSquare size={14} color="#fff" /></div>
                      <span style={styles.shortsDeskText}>143</span>
                    </div>
                  </div>
                  
                  <div style={styles.shortsDeskInfo}>
                    <h4 style={styles.shortsDeskTitle}>{displayTitle}</h4>
                    <div style={styles.channelRow}>
                      <span style={styles.channelName}>TechVanguard</span>
                      <CheckCircle2 size={12} color="#aaa" style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Fullsize Mobile Shorts Mockup inside a detailed Phone Frame */
            <div style={styles.phoneMockupFrame}>
              <div style={styles.phoneNotch}></div>
              <div style={styles.phoneScreen}>
                
                {/* Status Bar */}
                <div style={styles.phoneStatusBar}>
                  <span style={{ fontSize: '9px', color: '#ffffff', fontWeight: 600 }}>12:30</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', color: '#ffffff' }}>📶 🔋</span>
                  </div>
                </div>

                {/* Shorts Player UI */}
                <div style={styles.shortsMobilePlayer}>
                  <img 
                    src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=640'} 
                    alt="YouTube Shorts Mobile Feed" 
                    style={styles.shortsMobileImage}
                  />
                  
                  {/* Visual overlay gradient */}
                  <div style={styles.shortsMobileVignette}></div>

                  {/* Right side interaction buttons overlay */}
                  <div style={styles.shortsMobileRightIcons}>
                    <div style={styles.shortsMobileAvatarCircle}>
                      <User size={12} color="#ffffff" />
                      <div style={styles.shortsMobileAvatarPlus}>+</div>
                    </div>
                    
                    <div style={styles.shortsMobileIconGroup}>
                      <div style={styles.shortsMobileIconButton}>
                        <ThumbsUp size={14} color="#ffffff" fill="#ffffff" />
                      </div>
                      <span style={styles.shortsMobileIconText}>14K</span>
                    </div>

                    <div style={styles.shortsMobileIconGroup}>
                      <div style={styles.shortsMobileIconButton}>
                        <ThumbsDown size={14} color="#ffffff" />
                      </div>
                      <span style={styles.shortsMobileIconText}>Dislike</span>
                    </div>

                    <div style={styles.shortsMobileIconGroup}>
                      <div style={styles.shortsMobileIconButton}>
                        <MessageSquare size={14} color="#ffffff" fill="#ffffff" />
                      </div>
                      <span style={styles.shortsMobileIconText}>382</span>
                    </div>

                    <div style={styles.shortsMobileIconGroup}>
                      <div style={styles.shortsMobileIconButton}>
                        <Share2 size={14} color="#ffffff" fill="#ffffff" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span style={styles.shortsMobileIconText}>Share</span>
                    </div>

                    {/* Spinning vinyl record disc */}
                    <div className="shorts-vinyl-spin" style={styles.shortsMobileVinyl}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbe0b' }}></div>
                    </div>
                  </div>

                  {/* Bottom left metadata details */}
                  <div style={styles.shortsMobileBottomMeta}>
                    <div style={styles.shortsMobileChannelRow}>
                      <span style={styles.shortsMobileHandle}>@TechVanguard</span>
                      <button style={styles.shortsMobileSubscribeBtn}>Subscribe</button>
                    </div>
                    <p style={styles.shortsMobileTitleText}>{displayTitle}</p>
                    <div style={styles.shortsMobileMusicRow}>
                      <span style={{ fontSize: '9px', color: '#ffffff' }}>🎵 TechVanguard sound</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )
        ) : (
          /* Landscape Previews (Standard 16:9 format) */
          feedMode === 'desktop' ? (
            /* Desktop Home Card inside a gorgeous Browser Frame */
            <div style={styles.browserFrame}>
              <div style={styles.browserHeader}>
                <div style={styles.browserDots}>
                  <span style={{ ...styles.browserDot, background: '#ff5f56' }}></span>
                  <span style={{ ...styles.browserDot, background: '#ffbd2e' }}></span>
                  <span style={{ ...styles.browserDot, background: '#27c93f' }}></span>
                </div>
                <div style={styles.browserAddressBar}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '4px' }}>🔒</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>youtube.com/search?q=vignette</span>
                </div>
                <div style={{ width: '40px' }}></div>
              </div>
              
              <div style={styles.browserBody}>
                {/* Search Results Context Info */}
                <div style={styles.browserSearchHeader}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px' }}>Search Results query:</span>
                  <strong style={{ color: '#ffffff', fontSize: '10px', marginLeft: '4px' }}>"{displayTitle.slice(0, 32)}..."</strong>
                </div>

                <div style={styles.desktopCard}>
                  <div style={styles.thumbnailWrapper}>
                    <img 
                      src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=640'} 
                      alt="YouTube Card Mockup" 
                      style={styles.thumbnail}
                    />
                    <div style={styles.durationBadge}>14:32</div>
                  </div>
                  
                  <div style={styles.cardDetails}>
                    <div style={styles.avatar}>
                      <User size={16} color="#9ca3af" />
                    </div>
                    <div style={styles.textDetails}>
                      <h4 style={styles.videoTitle}>{displayTitle}</h4>
                      <div style={styles.channelRow}>
                        <span style={styles.channelName}>TechVanguard</span>
                        <CheckCircle2 size={12} color="#aaa" style={{ marginLeft: '4px' }} />
                      </div>
                      <div style={styles.viewsRow}>
                        <span>142K views</span>
                        <span style={styles.dot}>•</span>
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile Feed Card in Smartphone mock */
            <div style={styles.phoneMockupFrame}>
              <div style={styles.phoneNotch}></div>
              <div style={styles.phoneScreen}>
                
                {/* Status Bar */}
                <div style={styles.phoneStatusBar}>
                  <span style={{ fontSize: '9px', color: '#ffffff', fontWeight: 600 }}>12:30</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', color: '#ffffff' }}>📶 🔋</span>
                  </div>
                </div>

                <div style={styles.youtubeAppMock}>
                  {/* YouTube Mobile App Header */}
                  <div style={styles.youtubeHeaderMock}>
                    <span style={styles.ytLogoMock}>▶ YouTube</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#fff', fontSize: '10px' }}>🔍</span>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }}></div>
                    </div>
                  </div>

                  {/* Card item */}
                  <div style={styles.mobileCard}>
                    <div style={styles.thumbnailWrapperMobile}>
                      <img 
                        src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=640'} 
                        alt="YouTube Mobile Mockup" 
                        style={styles.thumbnail}
                      />
                      <div style={styles.durationBadgeMobile}>14:32</div>
                    </div>
                    
                    <div style={styles.cardDetailsMobile}>
                      <div style={styles.avatarMobile}>
                        <User size={10} color="#9ca3af" />
                      </div>
                      <div style={styles.textDetailsMobile}>
                        <h4 style={styles.videoTitleMobile}>{displayTitle}</h4>
                        <div style={styles.channelRowMobile}>
                          <span>TechVanguard</span>
                          <span style={styles.dot}>•</span>
                          <span>142K views</span>
                          <span style={styles.dot}>•</span>
                          <span>2h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search suggestions */}
                  <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: 'rgba(255,255,255,0.01)' }}>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Next:</span>
                    <p style={{ fontSize: '9px', color: 'var(--color-primary)', margin: '2px 0 0 0', fontWeight: 700 }}>✦ Audit Contrast Grades</p>
                  </div>
                </div>

              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.infoFooter}>
        <AlignLeft size={14} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={styles.infoText}>
          {isShorts ? (
            <><strong>Shorts Overlay Guard Active</strong>: The bottom-left area is heavily overlaid by YouTube Shorts title & channel handles, and the right border contains interactive buttons. Make sure key faces or important graphics are center-biased to remain clear of these safe zones!</>
          ) : (
            <><strong>Safe Zone Guard Active</strong>: The bottom-right duration badge overlay is rendered to simulate real YouTube obstruction. Make sure no text overlays or faces are hidden under this block!</>
          )}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    background: '#ffffff',
    border: '1.5px solid var(--border-subtle)',
    borderBottom: 'none',
    padding: '14px 20px',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    width: '100%',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.01)',
  },
  shortsIndicatorBadge: {
    fontSize: '9px',
    fontWeight: 800,
    background: 'var(--color-primary-glow)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: 'var(--color-primary)',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '0.05em',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
  },
  feedSelector: {
    display: 'flex',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    gap: '2px',
  },
  feedBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
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
  feedBtnActive: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  },
  feedBox: {
    background: '#f8fafc', // Premium designer dotted canvas background
    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', // Subtle grid dots
    backgroundSize: '24px 24px',
    border: '1.5px solid var(--border-subtle)',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    padding: '48px 24px 36px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '480px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02)',
  },
  browserFrame: {
    width: '380px',
    background: '#0f0f0f', // Youtube pitch black dark theme
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.05)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  browserHeader: {
    height: '36px',
    background: '#1a1a1a', // standard browser chrome window header
    borderBottom: '1px solid #282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
  },
  browserDots: {
    display: 'flex',
    gap: '6px',
  },
  browserDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  browserAddressBar: {
    background: '#0f0f0f',
    borderRadius: '6px',
    padding: '3px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    border: '1px solid #282828',
  },
  browserBody: {
    padding: '20px 30px 24px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    background: '#0f0f0f',
  },
  browserSearchHeader: {
    width: '320px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '8px',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  precisionScaleTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    border: '1.5px solid var(--border-subtle)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    zIndex: 10,
  },
  precisionDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--color-success)',
    boxShadow: '0 0 6px var(--color-success)',
    animation: 'float-fast 1.5s ease-in-out infinite',
  },
  desktopCard: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
  },
  cardDetails: {
    display: 'flex',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  videoTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f1f1f1',
    lineHeight: '1.4',
    maxHeight: '38px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  channelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  },
  channelName: {
    fontSize: '12px',
    color: '#aaa',
  },
  viewsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#aaa',
  },
  dot: {
    fontSize: '14px',
    lineHeight: '1',
  },

  /* Smartphone mock frame wrapper */
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
  mobileCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  thumbnailWrapperMobile: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    background: '#000000',
  },
  durationBadgeMobile: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    background: 'rgba(0, 0, 0, 0.85)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 4px',
    borderRadius: '2px',
  },
  cardDetailsMobile: {
    display: 'flex',
    gap: '8px',
    padding: '0 8px',
  },
  avatarMobile: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#282828',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textDetailsMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  videoTitleMobile: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#f1f1f1',
    lineHeight: '1.3',
    maxHeight: '30px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  channelRowMobile: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '4px',
    fontSize: '9px',
    color: '#aaa',
  },

  /* YouTube Shorts Desktop Preview */
  desktopShortsContainer: {
    width: '210px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  shortsDesktopFrame: {
    width: '100%',
    aspectRatio: '9/16',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#000000',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  shortsDesktopImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  shortsPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '12px',
  },
  shortsLogoOverlay: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '10px',
    background: '#ff0000',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  shortsDesktopControls: {
    position: 'absolute',
    right: '8px',
    bottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  shortsDeskBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsDeskText: {
    fontSize: '8px',
    color: '#fff',
    fontWeight: 700,
    marginTop: '-6px',
  },
  shortsDeskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 4px',
  },
  shortsDeskTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#ffffff',
    lineHeight: '1.4',
    maxHeight: '32px',
    overflow: 'hidden',
  },

  /* Shorts Mobile Player Layout */
  shortsMobilePlayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    background: '#000000',
  },
  shortsMobileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  shortsMobileVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '150px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
    pointerEvents: 'none',
  },
  shortsMobileRightIcons: {
    position: 'absolute',
    bottom: '30px',
    right: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    zIndex: 10,
  },
  shortsMobileAvatarCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ffbe0b',
    border: '1px solid #ffffff',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsMobileAvatarPlus: {
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
  shortsMobileIconGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
  },
  shortsMobileIconButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  shortsMobileIconText: {
    fontSize: '8px',
    color: '#ffffff',
    fontWeight: 600,
  },
  shortsMobileVinyl: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#111111',
    border: '2px solid #333333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortsMobileBottomMeta: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    width: 'calc(100% - 54px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 10,
    textAlign: 'left',
  },
  shortsMobileChannelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  shortsMobileHandle: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#ffffff',
  },
  shortsMobileSubscribeBtn: {
    background: '#ff0000',
    color: '#ffffff',
    border: 'none',
    fontSize: '8px',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  shortsMobileTitleText: {
    fontSize: '9px',
    color: '#ffffff',
    lineHeight: '1.3',
    fontWeight: 500,
    maxHeight: '24px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  shortsMobileMusicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  infoFooter: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: 'rgba(255, 107, 107, 0.05)',
    border: '1px solid rgba(255, 107, 107, 0.1)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
  },
  infoText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  }
};

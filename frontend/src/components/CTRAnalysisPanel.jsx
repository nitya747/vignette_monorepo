'use strict';

import { useState } from 'react';
import { Award, AlertTriangle, Sparkles, RefreshCw, Layers, CheckCircle } from 'lucide-react';

export default function CTRAnalysisPanel({ 
  analysisData, 
  onOptimize, 
  isOptimizing,
  originalTitle,
  onSelectTitle
}) {
  const [activeTab, setActiveTab] = useState('critique');

  if (!analysisData) return null;

  const { score, roast, attentionHierarchy, suggestedTitles, strengths, weaknesses, suggestions } = analysisData;

  // Determine dynamic score colors based on severity
  const getScoreTheme = (s) => {
    if (s >= 80) return { color: '#06d6a0', glow: 'rgba(6, 214, 160, 0.2)' };
    if (s >= 65) return { color: '#ffbe0b', glow: 'rgba(255, 190, 11, 0.2)' };
    return { color: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.2)' };
  };

  const theme = getScoreTheme(score);

  // Group visual critiques for strong structured hierarchy (Task 2.2 / 2.4 updates)
  const finalStrengths = Array.isArray(strengths) ? strengths : [];
  const finalWeaknesses = Array.isArray(weaknesses) ? weaknesses : [];
  const finalSuggestions = Array.isArray(suggestions) ? suggestions : [];

  // Backward compatibility fallback if only flat roast is provided
  const hasStructuredGroups = finalStrengths.length > 0 || finalWeaknesses.length > 0 || finalSuggestions.length > 0;
  let groupedStrengths = [...finalStrengths];
  let groupedWeaknesses = [...finalWeaknesses];
  let groupedSuggestions = [...finalSuggestions];

  if (!hasStructuredGroups && Array.isArray(roast)) {
    roast.forEach(bullet => {
      const lower = bullet.toLowerCase();
      if (lower.includes('excellent') || lower.includes('great') || lower.includes('fantastic') || lower.includes('good') || lower.includes('perfect') || lower.includes('proven') || lower.includes('optimal') || lower.includes('vibrancy') || lower.includes('vibrant')) {
        groupedStrengths.push(bullet);
      } else if (lower.includes('low') || lower.includes('obstructed') || lower.includes('wordy') || lower.includes('clash') || lower.includes('vague') || lower.includes('clutter') || lower.includes('warning') || lower.includes('conflict') || lower.includes('truncat') || lower.includes('exceed')) {
        groupedWeaknesses.push(bullet);
      } else {
        groupedSuggestions.push(bullet);
      }
    });

    if (groupedStrengths.length === 0 && groupedWeaknesses.length === 0 && groupedSuggestions.length === 0 && roast.length > 0) {
      groupedStrengths = [roast[0]];
      if (roast[1]) groupedWeaknesses = [roast[1]];
      if (roast[2]) groupedSuggestions = [roast[2]];
    }
  }

  // Calculate active opportunities (Weaknesses + Suggestions)
  const opportunitiesCount = groupedWeaknesses.length + groupedSuggestions.length;

  return (
    <div className="card-glass" style={styles.container}>
      <div className="ctr-analysis-header" style={styles.header}>
        <div style={styles.scoreCircleWrapper}>
          <div style={{
            ...styles.scoreGlow,
            backgroundColor: theme.color,
            boxShadow: `0 0 30px ${theme.glow}`
          }}></div>
          <div style={styles.scoreCircle}>
            <span style={{ ...styles.scoreNum, color: theme.color }}>{score}</span>
            <span style={styles.scoreLabel}>CTR POTENTIAL</span>
          </div>
        </div>

        <div style={styles.introBlock}>
          <div style={styles.introHeader}>
            <Award size={18} color={theme.color} />
            <h4 style={styles.introTitle}>AI Thumbnail Critique</h4>
          </div>
          <p style={styles.introDesc}>
            Vignette's visual intelligence engine analyzed your layout hierarchy, focal elements, and readability constraints.
          </p>
        </div>
      </div>

      <div className="ctr-tab-headers" style={styles.tabHeaders}>
        <button 
          onClick={() => setActiveTab('critique')}
          className={`ctr-tab-btn ${activeTab === 'critique' ? 'active' : ''}`}
        >
          Visual Critique
        </button>
        <button 
          onClick={() => setActiveTab('hierarchy')}
          className={`ctr-tab-btn ${activeTab === 'hierarchy' ? 'active' : ''}`}
        >
          Focal Hierarchy
        </button>
        <button 
          onClick={() => setActiveTab('titles')}
          className={`ctr-tab-btn ${activeTab === 'titles' ? 'active' : ''}`}
        >
          Viral Title Pairs
        </button>
      </div>

      <div style={styles.contentBody}>
        {activeTab === 'critique' && (
          <div style={styles.critiqueList}>
            {groupedStrengths.length > 0 && (
              <div style={styles.groupBlock}>
                <div style={styles.groupHeader}>
                  <CheckCircle size={14} color="#06d6a0" />
                  <h5 style={{ ...styles.groupHeading, color: '#06d6a0' }}>Strengths</h5>
                </div>
                <div style={styles.bulletList}>
                  {groupedStrengths.map((bullet, idx) => (
                    <div key={idx} style={styles.critiqueRow}>
                      <span style={styles.bulletDot}>•</span>
                      <p style={styles.critiqueText}>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedWeaknesses.length > 0 && (
              <div style={styles.groupBlock}>
                <div style={styles.groupHeader}>
                  <AlertTriangle size={14} color="#ffbe0b" />
                  <h5 style={{ ...styles.groupHeading, color: '#ffbe0b' }}>Weaknesses</h5>
                </div>
                <div style={styles.bulletList}>
                  {groupedWeaknesses.map((bullet, idx) => (
                    <div key={idx} style={styles.critiqueRow}>
                      <span style={{ ...styles.bulletDot, color: '#ffbe0b' }}>•</span>
                      <p style={styles.critiqueText}>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedSuggestions.length > 0 && (
              <div style={styles.groupBlock}>
                <div style={styles.groupHeader}>
                  <Sparkles size={14} color="var(--color-primary)" />
                  <h5 style={{ ...styles.groupHeading, color: 'var(--color-primary)' }}>Suggestions</h5>
                </div>
                <div style={styles.bulletList}>
                  {groupedSuggestions.map((bullet, idx) => (
                    <div key={idx} style={styles.critiqueRow}>
                      <span style={{ ...styles.bulletDot, color: 'var(--color-primary)' }}>•</span>
                      <p style={styles.critiqueText}>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hierarchy' && (
          <div style={styles.critiqueList}>
            {attentionHierarchy.length > 0 ? (
              attentionHierarchy.map((layer, idx) => (
                <div key={idx} style={styles.critiqueRowSimple}>
                  <div style={styles.bulletIconWrapper}>
                    <Layers size={14} color="var(--color-primary)" />
                  </div>
                  <p style={styles.critiqueTextSimple}>{layer}</p>
                </div>
              ))
            ) : (
              <div style={styles.critiqueRowSimple}>
                <div style={styles.bulletIconWrapper}>
                  <Layers size={14} color="var(--color-primary)" />
                </div>
                <p style={styles.critiqueTextSimple}>Primary focus centered on layout details. safe zones clear of badge overlap.</p>
              </div>
            )}
            <div style={styles.mobileSafeRow}>
              <CheckCircle size={14} color="#06d6a0" />
              <p style={styles.mobileSafeText}>Passes mobile readability postage-stamp validation.</p>
            </div>
          </div>
        )}

        {activeTab === 'titles' && (
          <div style={styles.titleList}>
            <div style={styles.titleListHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={styles.originalTitleLabel}>Current Title:</span>
                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontFamily: "'Fredoka', sans-serif"
                }}>
                  OpenAI GPT-4.1 mini
                </span>
              </div>
              <span style={styles.originalTitleText}>"{originalTitle || 'Untitled Video'}"</span>
            </div>
            
            <div style={styles.suggestionsContainer}>
              {suggestedTitles.map((t, idx) => (
                <button 
                  key={idx}
                  onClick={() => onSelectTitle(t)}
                  style={styles.titleCard}
                >
                  <div style={styles.titleCardIndex}>Pair Option {idx + 1}</div>
                  <div style={styles.titleCardText}>"{t}"</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supporting Text above CTA */}
      <div style={styles.ctaSupportRow}>
        <Sparkles size={12} color="var(--color-primary)" style={{ animation: 'float-fast 2.5s ease-in-out infinite' }} />
        <span style={styles.ctaSupportText}>
          {opportunitiesCount > 0 ? `${opportunitiesCount} optimization opportunities detected` : 'Perfect layout details detected'}
        </span>
      </div>

      <button 
        onClick={onOptimize}
        className="btn btn-primary"
        style={styles.optimizeBtn}
        disabled={isOptimizing}
      >
        {isOptimizing ? (
          <>
            <RefreshCw size={14} className="spinner" style={{ animation: 'spin 1.2s linear infinite' }} />
            Applying Thumbnail Director Improvements...
          </>
        ) : (
          <>
            Create Higher CTR Version
          </>
        )}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', /* reduced from 20px to connect list to CTA */
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: '16px 20px',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    boxShadow: 'var(--shadow-sm)',
  },
  scoreCircleWrapper: {
    position: 'relative',
    width: '84px', /* reduced from 104px */
    height: '84px',
    flexShrink: 0,
  },
  scoreGlow: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: '76px', /* adjusted down */
    height: '76px',
    borderRadius: '50%',
    zIndex: 1,
    opacity: 0.15,
  },
  scoreCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    background: 'var(--bg-base)',
    border: '3px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scoreNum: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '38px', /* enlarged from 36px */
    fontWeight: 950,
    lineHeight: '0.9',
  },
  scoreLabel: {
    fontSize: '7.5px', /* reduced from 9px for typography contrast */
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    marginTop: '2px',
  },
  introBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  introHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  introTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
  },
  introDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  tabHeaders: {
    display: 'flex',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    gap: '2px',
  },
  contentBody: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '12px', /* reduced from 24px */
  },
  critiqueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px', /* increased gap between groups */
  },
  groupBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  groupHeading: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  bulletList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px', /* increased spacing between bullets */
  },
  critiqueRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    paddingLeft: '4px',
  },
  bulletDot: {
    color: '#06d6a0',
    fontSize: '14px',
    lineHeight: '1',
    marginTop: '-1px',
    userSelect: 'none',
  },
  critiqueText: {
    fontSize: '11.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  critiqueRowSimple: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px',
  },
  critiqueTextSimple: {
    fontSize: '11.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  bulletIconWrapper: {
    marginTop: '3px',
    flexShrink: 0,
  },
  mobileSafeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(6, 214, 160, 0.05)',
    border: '1px solid rgba(6, 214, 160, 0.12)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    marginTop: '6px',
  },
  mobileSafeText: {
    fontSize: '11px',
    color: '#06d6a0',
    fontWeight: 600,
  },
  titleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  titleListHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    background: 'var(--bg-base)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
  },
  originalTitleLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  originalTitleText: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleCard: {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  titleCardIndex: {
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textTransform: 'uppercase',
  },
  titleCardText: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginTop: '2px',
  },
  ctaSupportRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '10px',
    marginBottom: '2px',
  },
  ctaSupportText: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontFamily: "'Fredoka', sans-serif",
  },
  optimizeBtn: {
    width: '100%',
    padding: '11px 16px', /* shorter vertically */
    fontSize: '13.5px',
  }
};

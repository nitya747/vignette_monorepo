'use strict';

import React from 'react';
import { Gamepad2, TrendingUp, Film, Cpu, Dumbbell, Sparkles, GraduationCap } from 'lucide-react';
import { NICHES } from '../lib/prompts';

const NICHE_ICONS = {
  gaming: Gamepad2,
  finance: TrendingUp,
  documentary: Film,
  tech: Cpu,
  fitness: Dumbbell,
  education: GraduationCap
};

const NICHE_THEMES = {
  gaming: { border: 'rgba(6, 214, 160, 0.25)', activeBorder: '#06d6a0', glow: 'rgba(6, 214, 160, 0.15)' },
  finance: { border: 'rgba(255, 190, 11, 0.25)', activeBorder: '#ffbe0b', glow: 'rgba(255, 190, 11, 0.15)' },
  documentary: { border: 'rgba(217, 119, 6, 0.25)', activeBorder: '#d97706', glow: 'rgba(217, 119, 6, 0.15)' },
  tech: { border: 'rgba(255, 122, 0, 0.25)', activeBorder: '#ff7a00', glow: 'rgba(255, 122, 0, 0.15)' },
  fitness: { border: 'rgba(255, 107, 107, 0.25)', activeBorder: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.15)' },
  education: { border: 'rgba(99, 102, 241, 0.25)', activeBorder: '#6366f1', glow: 'rgba(99, 102, 241, 0.15)' }
};

export default function NichePicker({ selectedNiche, onSelect }) {
  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <h3 style={styles.sectionTitle}>1. Select Target Niche</h3>
        <span className="badge badge-primary">
          <Sparkles size={10} style={{ marginRight: '4px' }} />
          Style Preset Optimized
        </span>
      </div>
      
      <div style={styles.grid}>
        {Object.values(NICHES).map((niche) => {
          const Icon = NICHE_ICONS[niche.id] || Sparkles;
          const isSelected = selectedNiche === niche.id;
          const theme = NICHE_THEMES[niche.id];
          
          return (
            <button
              key={niche.id}
              onClick={() => onSelect(niche.id)}
              style={{
                ...styles.card,
                ...(isSelected ? {
                  borderColor: theme.activeBorder,
                  boxShadow: `0 8px 24px ${theme.glow}`,
                  background: 'rgba(255, 255, 255, 0.02)'
                } : {})
              }}
            >
              <div style={{
                ...styles.iconWrapper,
                ...(isSelected ? {
                  backgroundColor: theme.glow,
                  borderColor: theme.activeBorder
                } : {})
              }}>
                <Icon size={20} color={isSelected ? theme.activeBorder : 'var(--text-secondary)'} />
              </div>
              
              <div style={styles.textGroup}>
                <span style={{
                  ...styles.nicheName,
                  ...(isSelected ? { color: 'var(--color-primary-hover)' } : {})
                }}>{niche.name}</span>
                <span style={styles.nicheDesc}>{niche.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    flexShrink: 0,
    transition: 'all var(--transition-fast)',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nicheName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
  },
  nicheDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
  }
};

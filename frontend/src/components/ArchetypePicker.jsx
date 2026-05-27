'use strict';

import React from 'react';
import { Target, HelpCircle, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { ARCHETYPES } from '../lib/prompts';

const ARCHETYPE_ICONS = {
  reaction: Eye,
  versus: RefreshCw,
  hero: Target,
  question: HelpCircle
};

export default function ArchetypePicker({ selectedArchetype, onSelect }) {
  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <h3 style={styles.sectionTitle}>2. Choose Design Archetype</h3>
        <span className="badge badge-accent">
          <Sparkles size={10} style={{ marginRight: '4px' }} />
          Focal Guide Safe
        </span>
      </div>
      
      <div style={styles.grid}>
        {Object.values(ARCHETYPES).map((arch) => {
          const Icon = ARCHETYPE_ICONS[arch.id] || Sparkles;
          const isSelected = selectedArchetype === arch.id;
          
          return (
            <button
              key={arch.id}
              onClick={() => onSelect(arch.id)}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardActive : {})
              }}
            >
              <div style={styles.header}>
                <div style={{
                  ...styles.iconWrapper,
                  ...(isSelected ? styles.iconActive : {})
                }}>
                  <Icon size={18} color={isSelected ? 'var(--color-primary)' : 'var(--text-secondary)'} />
                </div>
                <span style={{
                  ...styles.archName,
                  ...(isSelected ? { color: 'var(--color-primary-hover)' } : {})
                }}>{arch.name}</span>
              </div>
              
              <p style={styles.archDesc}>{arch.description}</p>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    width: '100%',
  },
  cardActive: {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 8px 24px var(--color-primary-glow)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    flexShrink: 0,
    transition: 'all var(--transition-fast)',
  },
  iconActive: {
    borderColor: 'rgba(124, 58, 237, 0.3)',
    backgroundColor: 'var(--color-primary-glow)',
  },
  archName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
  },
  archDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  }
};

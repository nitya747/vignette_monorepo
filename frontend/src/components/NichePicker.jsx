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
          
          return (
            <button
              key={niche.id}
              onClick={() => onSelect(niche.id)}
              style={{
                ...styles.card,
                ...(isSelected ? {
                  borderColor: 'var(--color-secondary)',
                  boxShadow: '0 8px 24px var(--color-secondary-glow)',
                  background: 'var(--color-secondary-glow)'
                } : {})
              }}
            >
              <div style={{
                ...styles.iconWrapper,
                ...(isSelected ? {
                  backgroundColor: 'var(--color-secondary-glow)',
                  borderColor: 'var(--color-secondary)'
                } : {})
              }}>
                <Icon size={20} color={isSelected ? 'var(--color-secondary)' : 'var(--text-secondary)'} />
              </div>
              
              <div style={styles.textGroup}>
                <span style={{
                  ...styles.nicheName,
                  ...(isSelected ? { color: 'var(--color-secondary)' } : {})
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
    fontFamily: "'Fredoka', sans-serif",
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
    fontFamily: "'Fredoka', sans-serif",
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

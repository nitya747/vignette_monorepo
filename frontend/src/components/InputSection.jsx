'use strict';


import { AlignLeft } from 'lucide-react';

export default function InputSection({ values, onChange }) {
  return (
    <div className="card-glass" style={styles.card}>
      <div style={styles.header}>
        <AlignLeft size={16} color="var(--color-primary)" />
        <h4 style={styles.headerTitle}>Manual Context Input</h4>
      </div>

      <div style={styles.form}>
        <div className="input-group">
          <label className="input-label" htmlFor="video-title">Video Title</label>
          <input 
            id="video-title"
            type="text" 
            placeholder="e.g., How AI is Rewriting the Future of Code"
            className="input-field"
            value={values.title}
            onChange={(e) => onChange('title', e.target.value)}
            style={styles.input}
          />
          {values.title.length > 0 && (
            <span style={styles.counter}>
              {values.title.split(/\s+/).filter(Boolean).length} / 10 words recommended limit
            </span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="video-topic">Core Video Topic</label>
          <textarea 
            id="video-topic"
            placeholder="Describe the primary visual story or lesson in this video..."
            className="input-field"
            value={values.topic}
            onChange={(e) => onChange('topic', e.target.value)}
            rows={3}
            style={{ ...styles.input, resize: 'none' }}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="video-keywords">Keywords (comma-separated)</label>
          <input 
            id="video-keywords"
            type="text" 
            placeholder="e.g., AI, future, coding, tech"
            className="input-field"
            value={values.keywords}
            onChange={(e) => onChange('keywords', e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
    marginBottom: '4px',
  },
  headerTitle: {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    width: '100%',
  },
  counter: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
    marginTop: '4px',
  }
};

'use strict';

import React, { useState } from 'react';
import { Video, AlignLeft, Sparkles, AlertCircle } from 'lucide-react';

export default function InputSection({ values, onChange, onAutoFill }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Extract video ID via regex and call serverless /api/extract API
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
      
      onAutoFill({
        title: data.title,
        topic: data.topic,
        keywords: data.keywords
      });
      
      setIsUrlLoading(false);
      setActiveTab('manual'); // snap back to manual form to edit extracted values
      setYoutubeUrl('');
    } catch (err) {
      console.error('Failed to extract YouTube details:', err);
      setUrlError(err.message || 'An unexpected error occurred during URL extraction.');
      setIsUrlLoading(false);
    }
  };

  return (
    <div className="card-glass" style={styles.card}>
      <div style={styles.tabHeaders}>
        <button 
          onClick={() => setActiveTab('manual')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'manual' ? styles.tabActive : {})
          }}
        >
          <AlignLeft size={16} />
          Manual Context Input
        </button>
        
        <button 
          onClick={() => setActiveTab('youtube')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'youtube' ? styles.tabActive : {})
          }}
        >
          <Video size={16} color="#ff6b6b" />
          YouTube URL Import
        </button>
      </div>

      {activeTab === 'manual' ? (
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
      ) : (
        <form onSubmit={handleUrlFetch} style={styles.form}>
          <div style={styles.urlIntro}>
            <Sparkles size={16} color="#7c3aed" />
            <p style={styles.urlIntroText}>
              Paste your YouTube URL to auto-extract the title and description context.
            </p>
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label" htmlFor="yt-url">YouTube Video URL</label>
            <input 
              id="yt-url"
              type="text" 
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              style={styles.input}
              disabled={isUrlLoading}
            />
          </div>

          {urlError && (
            <div style={styles.errorContainer}>
              <AlertCircle size={16} color="#ff6b6b" />
              <span style={styles.errorText}>{urlError}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isUrlLoading || !youtubeUrl}
          >
            {isUrlLoading ? (
              <span style={styles.spinner}></span>
            ) : (
              <>
                <Sparkles size={16} />
                Extract Video Details
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    height: '100%',
  },
  tabHeaders: {
    display: 'flex',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
    gap: '4px',
  },
  tabBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  tabActive: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    width: '100%',
  },
  counter: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
    marginTop: '-4px',
  },
  urlIntro: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(124, 58, 237, 0.05)',
    border: '1px solid rgba(124, 58, 237, 0.1)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '16px',
  },
  urlIntroText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 107, 107, 0.05)',
    border: '1px solid rgba(255, 107, 107, 0.12)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: '12px',
    color: '#ff6b6b',
    fontWeight: 500,
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: '#ffffff',
    animation: 'spin 0.8s linear infinite',
  }
};

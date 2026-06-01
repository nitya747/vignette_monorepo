import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Eye, Trash2, ChevronLeft, ChevronRight, FolderOpen, LogIn, Edit3, Download } from 'lucide-react';

export default function LibraryPanel({ session, onSelect, onOpenAuth }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Inline rename editing states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (!session) return;
    fetchHistory();
  }, [session, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/history?page=${page}&limit=${limit}&_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to retrieve history');
      }

      const data = await response.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('[Library Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRename = (e, item) => {
    e.stopPropagation(); // Prevent card select click
    setEditingId(item.id);
    setEditTitle(item.title || '');
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveRename = async (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ title: editTitle.trim() })
      });

      if (response.ok) {
        // Optimistically update list state instantly
        setItems(prev => prev.map(item => item.id === id ? { ...item, title: editTitle.trim() } : item));
        setEditingId(null);
        setEditTitle('');
      } else {
        throw new Error('Failed to rename project');
      }
    } catch (err) {
      console.error('[Library Rename Error]', err);
      alert('Failed to rename project. Please try again.');
    }
  };

  const handleDownloadThumbnail = async (e, item) => {
    e.stopPropagation();
    if (!item.imageUrl) return;

    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const sanitizedTitle = (item.title || 'thumbnail')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');
      a.download = `${sanitizedTitle || 'thumbnail'}.png`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Library Thumbnail Download Error]', err);
      // Fallback: open in new tab if CORS blocks fetch
      const a = document.createElement('a');
      a.href = item.imageUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering card selection
    setDeletingId(id);
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        // Filter out item instantly for responsive micro-animation experience
        setItems(prev => prev.filter(item => item.id !== id));
        setTotal(prev => Math.max(0, prev - 1));
        
        // Adjust page if we deleted the last item on the page
        if (items.length === 1 && page > 1) {
          setPage(prev => prev - 1);
        }
      } else {
        throw new Error('Failed to delete generation');
      }
    } catch (err) {
      console.error('[Library Delete Error]', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getBadgeStyle = (niche) => {
    const style = {
      fontSize: '9px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      padding: '3px 8px',
      borderRadius: '20px',
      display: 'inline-block'
    };
    
    switch (niche) {
      case 'gaming':
        return { ...style, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'finance':
        return { ...style, background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      case 'documentary':
        return { ...style, background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' };
      case 'tech':
        return { ...style, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'education':
        return { ...style, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
      default:
        return { ...style, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    }
  };

  if (!session) {
    /* Guest View: CTA to prompt AuthModal */
    return (
      <div className="flex-center card-glass" style={styles.guestContainer}>
        <div style={styles.guestInner}>
          <FolderOpen size={48} color="var(--color-primary)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h2 style={styles.guestTitle}>Your Personal Project Library</h2>
          <p style={styles.guestSub}>Log in to automatically save, sync, and retrieve your click-optimized thumbnails and CTR roasts across devices.</p>
          <button 
            onClick={onOpenAuth}
            className="btn btn-primary"
            style={styles.guestBtn}
          >
            <LogIn size={14} style={{ marginRight: '8px' }} />
            Sign In to Unlock
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="card-glass" style={styles.panel}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Saved Thumbnail Projects</h2>
          <p style={styles.sub}>Access your past generated blueprints and clickability critique parameters.</p>
        </div>
        <div style={styles.totalBadge}>
          {total} Total Generated
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div style={styles.loaderContainer}>
          <span className="spinner" style={styles.spinner}></span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Scanning account vault...</span>
        </div>
      ) : items.length === 0 ? (
        <div style={styles.emptyContainer}>
          <FolderOpen size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600, margin: 0 }}>No Saved Projects Yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '240px', textAlign: 'center', margin: '4px 0 0 0', lineHeight: '1.4' }}>
            Generate a custom thumbnail on the workspace, then click "Save to Library" to start building your moat.
          </p>
        </div>
      ) : (
        <>
          {/* Grid of history cards */}
          <div style={styles.grid}>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => !isEditing && onSelect(item)}
                  style={styles.card}
                  className="library-card-hover"
                >
                  {/* Thumbnail Preview wrapper */}
                  <div style={styles.imageWrapper}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title || 'Saved Generation'} 
                      style={styles.image}
                    />
                    
                    {/* Visual CTR Score Badge */}
                    {item.analysis && (
                      <div style={{
                        ...styles.scoreBadge,
                        background: item.analysis.score >= 80 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ff8138 0%, #ffbe0b 100%)'
                      }}>
                        <Eye size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        <span>{item.analysis.score}% CTR</span>
                      </div>
                    )}

                    {/* Download overlay button */}
                    <button 
                      onClick={(e) => handleDownloadThumbnail(e, item)}
                      className="library-card-download-btn"
                      style={styles.downloadBtn}
                      title="Download Thumbnail"
                    >
                      <Download size={13} />
                    </button>

                    {/* Delete Trash overlay button */}
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      className="library-card-delete-btn"
                      style={styles.deleteBtn}
                      title="Delete Project"
                    >
                      {deletingId === item.id ? (
                        <span className="spinner" style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>

                  {/* Details card content */}
                  <div style={styles.cardBody}>
                    <div style={styles.badgeRow}>
                      <span style={getBadgeStyle(item.niche)}>
                        {item.niche}
                      </span>
                      <span style={styles.archetypeBadge}>
                        {item.archetype || 'Reaction'}
                      </span>
                    </div>
                    
                    {isEditing ? (
                      <div style={styles.editRow} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={styles.editInput}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e, item.id);
                            if (e.key === 'Escape') handleCancelRename(e);
                          }}
                        />
                        <button 
                          onClick={(e) => handleSaveRename(e, item.id)}
                          style={styles.editBtnOk}
                          title="Save Title"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={handleCancelRename}
                          style={styles.editBtnCancel}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={styles.titleRow}>
                        <h4 style={styles.cardTitle} title={item.title || ''}>
                          {item.title || 'Untitled Generation'}
                        </h4>
                        <button 
                          onClick={(e) => handleStartRename(e, item)}
                          style={styles.renameIconBtn}
                          title="Rename Project"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}

                    <div style={styles.dateRow}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={11} color="var(--text-muted)" style={{ marginRight: '4px' }} />
                        <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <button 
                        onClick={(e) => handleDownloadThumbnail(e, item)}
                        className="library-card-action-download-btn"
                        style={styles.cardDownloadActionBtn}
                        title="Download Thumbnail Image"
                      >
                        <Download size={11} style={{ marginRight: '4px' }} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                style={{
                  ...styles.pagerBtn,
                  ...(page === 1 ? styles.pagerBtnDisabled : {})
                }}
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span style={styles.pagerLabel}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of {totalPages}
              </span>
              <button 
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                style={{
                  ...styles.pagerBtn,
                  ...(page === totalPages ? styles.pagerBtnDisabled : {})
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}

const styles = {
  guestContainer: {
    height: '420px',
    borderRadius: '24px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  guestInner: {
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  guestTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '0 0 8px 0'
  },
  guestSub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: '0 0 20px 0'
  },
  guestBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '10px'
  },
  panel: {
    background: 'rgba(255, 255, 255, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.04)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '28px',
    textAlign: 'left'
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: '0 0 4px 0'
  },
  sub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  totalBadge: {
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'var(--color-primary)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '11px',
    fontWeight: 800,
    padding: '6px 14px',
    borderRadius: '20px'
  },
  loaderContainer: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2.5px solid var(--border-subtle)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  emptyContainer: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.015)'
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: '16/9',
    width: '100%',
    overflow: 'hidden',
    background: '#000000',
    borderBottom: '1px solid rgba(0, 0, 0, 0.03)'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  scoreBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
  },
  downloadBtn: {
    position: 'absolute',
    top: '10px',
    right: '40px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(15, 15, 20, 0.6)',
    border: 'none',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all var(--transition-fast)',
    zIndex: 5,
  },
  deleteBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(15, 15, 20, 0.6)',
    border: 'none',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0, // shown on card hover in CSS rules, handled responsively
    transition: 'all var(--transition-fast)',
    zIndex: 5,
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
    flex: 1
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  archetypeBadge: {
    fontSize: '9px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    background: 'rgba(0,0,0,0.03)',
    padding: '3px 8px',
    borderRadius: '20px'
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    flex: 1
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    flex: 1
  },
  renameIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    marginTop: '2px',
    outline: 'none'
  },
  editRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    flex: 1
  },
  editInput: {
    flex: 1,
    height: '28px',
    padding: '0 6px',
    borderRadius: '6px',
    border: '1px solid var(--color-primary)',
    background: '#ffffff',
    fontSize: '12px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'Inter, sans-serif'
  },
  editBtnOk: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: 'none',
    background: '#10b981',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 900
  },
  editBtnCancel: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: 'none',
    background: '#ef4444',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 900
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: 'auto'
  },
  cardDownloadActionBtn: {
    background: 'rgba(99, 102, 241, 0.06)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'var(--color-primary)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '8px'
  },
  pagerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '11px',
    fontWeight: 800,
    color: 'var(--text-secondary)',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
  },
  pagerBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    pointerEvents: 'none'
  },
  pagerLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  }
};

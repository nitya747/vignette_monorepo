'use strict';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, LogOut, User, ChevronDown } from 'lucide-react';

export default function Header({ user, onOpenAuth, onSignOut }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (!user || !user.email) return 'G';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        {/* Left: Logo */}
        <div style={styles.logoGroup} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={styles.logoIcon}>
            <Sparkles size={18} color="#ffffff" style={{ strokeWidth: 2.5 }} />
          </div>
          <span style={styles.logoText}>Vignette<span style={styles.logoHighlight}>.ai</span></span>
        </div>
        
        {/* Center: Pill Navigation */}
        <nav style={styles.nav}>
          <a href="#" style={{ ...styles.navLink, ...styles.navLinkActive }}>Design</a>
          <a href="#workspace" style={styles.navLink}>Product</a>
          <a href="#workspace" style={styles.navLink}>Plans</a>
          <a href="#workspace" style={styles.navLink}>Business</a>
          <a href="#workspace" style={styles.navLink}>Education</a>
          <a href="#workspace" style={styles.navLink}>Help</a>
        </nav>
        
        {/* Right: Actions */}
        <div style={styles.actions}>
          {user ? (
            /* Logged In View: Profile Avatar with dropdown */
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={styles.profileBtn}
              >
                <div className="user-avatar-pill" style={styles.avatarPill}>
                  {getInitial()}
                </div>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <span style={styles.dropdownEmail} title={user.email}>{user.email}</span>
                    <span style={styles.dropdownBadge}>Authenticated</span>
                  </div>
                  <div style={styles.divider}></div>
                  <button 
                    onClick={() => { onSignOut(); setShowProfileMenu(false); }}
                    style={styles.dropdownItem}
                  >
                    <LogOut size={14} style={{ marginRight: '8px' }} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest View: Login & Join CTAs */
            <>
              <button onClick={onOpenAuth} style={styles.loginBtn}>Sign In</button>
              <button 
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={styles.registerBtn}
              >
                Join Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(245, 243, 235, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    height: '10vh',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(255, 129, 56, 0.25)',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
  },
  logoHighlight: {
    color: 'var(--color-primary)',
  },
  nav: {
    display: 'none',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    padding: '4px',
    borderRadius: '24px',
  },
  navLink: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  navLinkActive: {
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'color var(--transition-fast)',
  },
  registerBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 16px',
    borderRadius: '10px',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background var(--transition-fast)',
  },
  avatarPill: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(255, 129, 56, 0.2)'
  },
  dropdown: {
    position: 'absolute',
    top: '42px',
    right: 0,
    width: '200px',
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
    borderRadius: '14px',
    backdropFilter: 'blur(10px)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    animation: 'fadeIn 0.15s ease-out',
    zIndex: 101
  },
  dropdownHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '4px 8px',
  },
  dropdownEmail: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  dropdownBadge: {
    fontSize: '9px',
    color: 'var(--color-primary)',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  divider: {
    height: '1px',
    background: 'rgba(0, 0, 0, 0.05)',
    margin: '4px 0'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
  }
};

// Responsive nav visibility
if (typeof window !== 'undefined') {
  const checkWidth = () => {
    const navEl = document.querySelector('nav');
    if (navEl) {
      if (window.innerWidth >= 768) {
        navEl.style.display = 'flex';
      } else {
        navEl.style.display = 'none';
      }
    }
  };
  window.addEventListener('resize', checkWidth);
  setTimeout(checkWidth, 100);
}

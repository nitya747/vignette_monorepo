'use strict';

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function Header() {
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
          <button style={styles.loginBtn}>Premium Plan</button>
          <div className="user-avatar-pill" title="User Profile: Nitya">
            N
          </div>
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
    height: '80px',
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
    gap: '16px',
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

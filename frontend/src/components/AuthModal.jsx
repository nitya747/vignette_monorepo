import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill out all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    // Sandbox mode mock validation if Supabase is unconfigured
    if (!supabase) {
      setTimeout(() => {
        setLoading(false);
        const mockSession = {
          user: {
            id: 'mock-sandbox-user-id',
            email: email,
            role: 'authenticated'
          },
          access_token: 'sandbox-jwt-token-secret-123456789'
        };
        console.log('[Auth Sandbox] Successful mock authentication for:', email);
        onAuthSuccess(mockSession);
        onClose();
      }, 1000);
      return;
    }

    try {
      if (activeTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        onAuthSuccess(data.session);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;

        // If email confirmation is required
        if (data.user && data.session === null) {
          setInfoMsg('Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
        } else if (data.session) {
          onAuthSuccess(data.session);
          onClose();
        }
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Decorative dynamic glows */}
        <div style={styles.glowTop}></div>
        <div style={styles.glowBottom}></div>

        {/* Close Button */}
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={18} />
        </button>

        {/* Brand Logo header */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <Sparkles size={16} color="#ffffff" style={{ strokeWidth: 2.5 }} />
          </div>
          <h2 style={styles.title}>
            vignette<span style={{ color: 'var(--color-primary)' }}>.ai</span>
          </h2>
          <p style={styles.subtitle}>Unlock CTR Optimizations & Saved Generations Library</p>
        </div>

        {/* Tab switchers */}
        <div style={styles.tabContainer}>
          <button 
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setInfoMsg(''); }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'login' ? styles.tabActive : {})
            }}
          >
            <LogIn size={14} style={{ marginRight: '6px' }} />
            Sign In
          </button>
          <button 
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); setInfoMsg(''); }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'signup' ? styles.tabActive : {})
            }}
          >
            <UserPlus size={14} style={{ marginRight: '6px' }} />
            Register
          </button>
        </div>

        {/* Status notifications */}
        {errorMsg && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '11px', lineHeight: '1.4' }}>{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div style={styles.infoAlert}>
            <span style={{ fontSize: '11px', lineHeight: '1.4' }}>{infoMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? (
              <span className="spinner" style={styles.spinner}></span>
            ) : activeTab === 'login' ? (
              'Access Account'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        {/* Sandbox Indicator */}
        {!supabase && (
          <div style={styles.sandboxIndicator}>
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 800 }}>
              ⚠️ Sandbox Mode Active (Bypasses verification keys)
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(15, 15, 20, 0.45)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(30px)',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  glowTop: {
    position: 'absolute',
    top: '-150px',
    right: '-150px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 129, 56, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  glowBottom: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'background var(--transition-fast)',
    zIndex: 10
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
    zIndex: 1,
    marginBottom: '24px'
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    width: '28px',
    height: '28px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(255, 129, 56, 0.25)'
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    margin: 0
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    maxWidth: '280px',
    margin: 0
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    padding: '3px',
    gap: '2px',
    zIndex: 1,
    marginBottom: '20px'
  },
  tabBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    padding: '8px 0',
    border: 'none',
    background: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  tabActive: {
    background: '#ffffff',
    color: 'var(--text-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#dc2626',
    zIndex: 1,
    marginBottom: '16px',
    textAlign: 'center'
  },
  infoAlert: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#059669',
    zIndex: 1,
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    zIndex: 1
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-secondary)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px'
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '0 12px 0 38px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: 'rgba(255, 255, 255, 0.65)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: 'var(--text-primary)',
    transition: 'all var(--transition-fast)'
  },
  submitBtn: {
    marginTop: '6px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  sandboxIndicator: {
    marginTop: '16px',
    textAlign: 'center',
    zIndex: 1
  }
};

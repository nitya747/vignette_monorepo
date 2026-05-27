'use strict';

import React, { useRef, useEffect, useState } from 'react';
import { Download, LayoutGrid, Type, Sliders, Sparkles, RefreshCw } from 'lucide-react';
import { triggerCanvasDownload, validateSpecs } from '../lib/specs';

export default function CanvasEditor({ imageUrl, onCancel, onSave, aspectRatio = '16:9' }) {
  const canvasRef = useRef(null);
  const isShorts = aspectRatio === '9:16';
  
  // Dynamic 6-Quadrant Snap Coordinates depending on aspect ratio
  const snapPositions = isShorts ? {
    'top-left': { label: 'Top Left', x: 50, y: 200, align: 'left' },
    'middle-left': { label: 'Middle Left', x: 50, y: 640, align: 'left' },
    'bottom-left': { label: 'Bottom Left', x: 50, y: 1040, align: 'left' },
    'top-center': { label: 'Top Center', x: 360, y: 200, align: 'center' },
    'middle-center': { label: 'Middle Center', x: 360, y: 640, align: 'center' },
    'top-right': { label: 'Top Right', x: 670, y: 200, align: 'right' }
  } : {
    'top-left': { label: 'Top Left', x: 60, y: 140, align: 'left' },
    'middle-left': { label: 'Middle Left', x: 60, y: 380, align: 'left' },
    'bottom-left': { label: 'Bottom Left', x: 60, y: 580, align: 'left' },
    'top-center': { label: 'Top Center', x: 640, y: 140, align: 'center' },
    'middle-center': { label: 'Middle Center', x: 640, y: 380, align: 'center' },
    'top-right': { label: 'Top Right', x: 1220, y: 140, align: 'right' }
  };

  // Text Overlay State
  const [text, setText] = useState('CRITICAL HOOK!');
  const [snapPos, setSnapPos] = useState('top-left');
  const [fontSize, setFontSize] = useState(isShorts ? 60 : 85); // smaller initial font for portrait width
  const [fontColor, setFontColor] = useState('#ffbe0b'); // gold primary for maximum contrast
  const [useStroke, setUseStroke] = useState(true);
  const [useShadow, setUseShadow] = useState(true);
  
  const [isExporting, setIsExporting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  // Load the background image on state change
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // prevent dirty canvas CORS issues
    img.src = imageUrl;
    
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
  }, [imageUrl]);

  // Re-draw canvas whenever any styling state changes
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, text, snapPos, fontSize, fontColor, useStroke, useShadow, aspectRatio]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const width = isShorts ? 720 : 1280;
    const height = isShorts ? 1280 : 720;
    
    // 1. Draw Background Image scaled exactly to bounds
    ctx.drawImage(imageRef.current, 0, 0, width, height);
    
    if (!text.trim()) return;
    
    // 2. Setup Typography Styles
    ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
    ctx.fillStyle = fontColor;
    
    const coords = snapPositions[snapPos] || snapPositions['top-left'];
    ctx.textAlign = coords.align;
    ctx.textBaseline = 'middle';
    
    // 3. Draw Heavy Drop-Shadow if checked (for pop and separation)
    if (useShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = isShorts ? 5 : 8;
      ctx.shadowOffsetY = isShorts ? 5 : 8;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // 4. Draw Custom Text Stroke/Outline (Crucial for high legibility on complex scenes)
    if (useStroke) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(6, fontSize * 0.12); // proportional thick stroke outline
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeText(text, coords.x, coords.y);
    }
    
    // 5. Draw Primary Text Fill
    ctx.fillText(text, coords.x, coords.y);
  };

  const handleDownload = () => {
    setIsExporting(true);
    const canvas = canvasRef.current;
    
    if (canvas) {
      const width = isShorts ? 720 : 1280;
      const height = isShorts ? 1280 : 720;
      
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('[Vignette Editor] Failed to generate PNG blob from canvas');
          setIsExporting(false);
          return;
        }

        // Validate specifications with the actual image dimensions and exact byte size
        const validCheck = validateSpecs(width, height, blob.size, aspectRatio);
        
        if (!validCheck.valid) {
          console.warn('[Vignette Editor] Image validation warnings:', validCheck.warnings);
          const warningMsg = `YouTube compliance warning:\n\n${validCheck.warnings.join('\n')}`;
          alert(warningMsg);
        } else {
          console.log(`[Vignette Editor] Specifications validated successfully. File size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        }

        // Download the exact validated blob
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = isShorts ? 'vignette-shorts-optimized.png' : 'vignette-ctr-optimized.png';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        if (onSave) {
          onSave(canvas.toDataURL('image/png'));
        }
      }, 'image/png');
    }
  };

  return (
    <div className="card-glass" style={styles.container}>
      <h3 style={styles.sectionTitle}>Defensive Snap-Grid Canvas Editor</h3>
      
      <div style={styles.editorBody}>
        {/* HTML5 Canvas viewport scaled responsively in UI */}
        <div style={{ 
          ...styles.canvasContainer, 
          aspectRatio: isShorts ? '9/16' : '16/9', 
          maxHeight: isShorts ? '450px' : 'none', 
          width: isShorts ? '253px' : '100%', 
          margin: '0 auto' 
        }}>
          <canvas 
            ref={canvasRef} 
            width={isShorts ? 720 : 1280} 
            height={isShorts ? 1280 : 720} 
            style={styles.canvas}
          />
        </div>

        {/* Panel controls */}
        <div style={styles.controlsPanel}>
          <div style={styles.controlHeader}>
            <Type size={16} color="var(--color-primary)" />
            <span style={styles.controlTitle}>Text Overlay Controls</span>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="overlay-text">Header Text</label>
            <input 
              id="overlay-text"
              type="text" 
              maxLength={25}
              placeholder="e.g., CRITICAL HOOK!"
              className="input-field"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <span style={styles.limitLabel}>{text.length} / 25 chars (Keep under 3-5 words)</span>
          </div>

          <div style={styles.controlHeader}>
            <LayoutGrid size={16} color="var(--color-primary)" />
            <span style={styles.controlTitle}>Grid Snap Position</span>
          </div>
          
          <div style={styles.gridSelector}>
            {Object.entries(snapPositions).map(([posKey, pos]) => (
              <button
                key={posKey}
                onClick={() => setSnapPos(posKey)}
                style={{
                  ...styles.gridBtn,
                  ...(snapPos === posKey ? styles.gridBtnActive : {})
                }}
              >
                {pos.label}
              </button>
            ))}
          </div>

          <div style={styles.controlHeader}>
            <Sliders size={16} color="var(--color-primary)" />
            <span style={styles.controlTitle}>Styling & Scaling</span>
          </div>

          <div style={styles.sliderGroup}>
            <div style={styles.sliderLabelRow}>
              <span style={styles.sliderLabel}>Font Size</span>
              <span style={styles.sliderVal}>{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min={isShorts ? 25 : 40} 
              max={isShorts ? 100 : 150} 
              className="slider"
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={styles.rangeInput}
            />
          </div>

          <div style={styles.colorSelectorRow}>
            <span style={styles.sliderLabel}>Text Color</span>
            <div style={styles.colorPalette}>
              {['#ffffff', '#ffbe0b', '#ff6b6b', '#06d6a0', '#38bdf8'].map(color => (
                <button
                  key={color}
                  onClick={() => setFontColor(color)}
                  style={{
                    ...styles.colorBtn,
                    backgroundColor: color,
                    borderColor: fontColor === color ? '#ffffff' : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={styles.toggleRow}>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={useStroke} 
                onChange={(e) => setUseStroke(e.target.checked)}
                style={styles.checkbox}
              />
              Thick Black Outline
            </label>
            
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={useShadow} 
                onChange={(e) => setUseShadow(e.target.checked)}
                style={styles.checkbox}
              />
              Drop Shadow
            </label>
          </div>

          <div style={styles.actionRow}>
            <button 
              onClick={onCancel}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back to Gallery
            </button>
            
            <button 
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ flex: 1.2 }}
              disabled={isExporting}
            >
              {isExporting ? (
                <RefreshCw size={16} className="spinner" style={{ animation: 'spin 1.2s linear infinite' }} />
              ) : (
                <>
                  <Download size={16} />
                  Export {isShorts ? '720x1280' : '1280x720'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
  },
  editorBody: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  canvasContainer: {
    width: '100%',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    background: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  controlsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
  },
  controlHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px',
    marginTop: '4px',
  },
  controlTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  limitLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
    marginTop: '-4px',
  },
  gridSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  gridBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    padding: '8px 4px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  gridBtnActive: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    borderColor: 'transparent',
    color: '#ffffff',
    boxShadow: '0 2px 8px var(--color-primary-glow)',
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  sliderVal: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer',
  },
  colorSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPalette: {
    display: 'flex',
    gap: '8px',
  },
  colorBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  toggleRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '4px',
  },
  checkboxLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  }
};

// Responsive viewports mapping in modern desktop screens
if (typeof window !== 'undefined') {
  const checkWidth = () => {
    if (window.innerWidth >= 900) {
      styles.editorBody.gridTemplateColumns = '1.3fr 0.7fr';
    } else {
      styles.editorBody.gridTemplateColumns = '1fr';
    }
  };
  window.addEventListener('resize', checkWidth);
  setTimeout(checkWidth, 100);
}

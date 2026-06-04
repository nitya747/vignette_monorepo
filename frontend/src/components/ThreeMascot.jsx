'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function ThreeMascot() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationFrameId;
    let renderer, scene, camera;
    let mascotMesh;
    let shadowMesh;
    
    // Mouse interaction variables
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalize mouse coords to [-1, 1]
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Helper to procedurally create a soft radial clay shadow texture
    const createShadowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, 128, 128);

      // Create a soft horizontal radial gradient ellipse shadow
      const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      gradient.addColorStop(0, 'rgba(26, 25, 23, 0.35)');
      gradient.addColorStop(0.5, 'rgba(26, 25, 23, 0.12)');
      gradient.addColorStop(1, 'rgba(26, 25, 23, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    try {
      const width = container.clientWidth || 380;
      const height = container.clientHeight || 380;

      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 7; // Enlarged view closeness

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 4. Create procedural drop shadow plane placed underneath the boots
      const shadowTexture = createShadowTexture();
      const shadowGeo = new THREE.PlaneGeometry(4.2, 1.2);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      });
      shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      // Place the shadow slightly behind and right below the character
      shadowMesh.position.set(0, -2.1, -0.4);
      scene.add(shadowMesh);

      // 5. Mascot camera texture loader
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        '/mascot_camera_nobg.png',
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          
          // Geometry for mascot plane - enlarged size (5.3 x 5.3)
          const geometry = new THREE.PlaneGeometry(5.3, 5.3);

          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
          });

          mascotMesh = new THREE.Mesh(geometry, material);
          mascotMesh.position.set(0, 0, 0);
          scene.add(mascotMesh);
          
          setLoading(false);
        },
        undefined,
        (err) => {
          console.error("Error loading mascot texture", err);
          setHasError(true);
          setLoading(false);
        }
      );

      // 6. Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smoothly interpolate mouse coords (lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        // Calculate dynamic height float
        const floatOffset = Math.sin(elapsedTime * 1.5) * 0.15;

        // Animate mascot plane
        if (mascotMesh) {
          // Extremely subtle dampened 3D rotation to prevent cardboard "flatness" exposure
          mascotMesh.rotation.y = mouse.x * 0.08;
          mascotMesh.rotation.x = -mouse.y * 0.08;
          
          // Fluid organic cursor follow slide + float
          mascotMesh.position.x = mouse.x * 0.18;
          mascotMesh.position.y = (mouse.y * 0.18) + floatOffset;
        }

        // Animate procedural drop shadow (opposing parallax movement + altitude scaling)
        if (shadowMesh) {
          // Slide in opposite direction of mouse to create high-depth parallax
          shadowMesh.position.x = -mouse.x * 0.08;
          shadowMesh.position.y = -2.15 - mouse.y * 0.08;

          // As mascot floats higher, shadow expands slightly and fades
          // As mascot gets closer to the boots, shadow gets smaller, darker, and sharper
          const shadowScaleFactor = 1.0 - floatOffset * 0.25;
          shadowMesh.scale.set(shadowScaleFactor, shadowScaleFactor, 1);
          shadowMesh.material.opacity = Math.max(0.2, 0.45 - floatOffset * 0.35);
        }

        renderer.render(scene, camera);
      };

      animate();

      // 7. Window Resize handler
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const w = containerRef.current.clientWidth || 380;
        const h = containerRef.current.clientHeight || 380;
        
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        
        renderer.setSize(w, h);
      };
      
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        if (container) {
          container.removeEventListener('mousemove', handleMouseMove);
        }
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        // Dispose geometries, materials, textures, etc.
        scene.traverse((object) => {
          if (!object.isMesh) return;
          
          object.geometry.dispose();

          if (object.material.isMaterial) {
            cleanMaterial(object.material);
          } else {
            for (const material of object.material) cleanMaterial(material);
          }
        });

        renderer.dispose();
      };

      function cleanMaterial(material) {
        material.dispose();
        for (const key of Object.keys(material)) {
          const value = material[key];
          if (value && typeof value.dispose === 'function') {
            value.dispose();
          }
        }
      }

    } catch (e) {
      console.error("Three.js initialization failed", e);
      setTimeout(() => {
        setHasError(true);
        setLoading(false);
      }, 0);
    }
  }, []);

  if (hasError) {
    // Fallback: standard static mascot camera image
    return (
      <div style={styles.fallbackContainer}>
        <img 
          src="/mascot_camera_nobg.png" 
          alt="Vigi automated YouTube Design Director" 
          style={styles.mascotCamera} 
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.container}>
      {loading && (
        <div style={styles.loader}>
          <div className="spin-slow" style={styles.spinner}></div>
        </div>
      )}
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
    outline: 'none',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(245, 243, 235, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 129, 56, 0.1)',
    borderTopColor: 'var(--color-primary)',
  },
  fallbackContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotCamera: {
    width: '85%',
    height: '85%',
    objectFit: 'contain',
  },
  crosshair: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    pointerEvents: 'none',
  }
};

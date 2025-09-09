import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from '../styles/ParticleSystem.module.css';

export default function ParticleSystem({ theme = 'default', intensity = 'medium' }) {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  const particleConfigs = {
    default: {
      count: 30,
      colors: ['#667eea', '#764ba2', '#38bdf8'],
      sizes: [2, 4, 6],
      speed: 1
    },
    cosmic: {
      count: 50,
      colors: ['#667eea', '#764ba2', '#e0e7ff', '#c7d2fe'],
      sizes: [1, 2, 3, 4],
      speed: 0.5
    },
    nature: {
      count: 25,
      colors: ['#11998e', '#38ef7d', '#4ade80', '#22c55e'],
      sizes: [2, 3, 4],
      speed: 0.8
    },
    sunset: {
      count: 35,
      colors: ['#ff9a9e', '#fecfef', '#fbbf24', '#f97316'],
      sizes: [2, 4, 5],
      speed: 1.2
    }
  };

  const intensityMultipliers = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    ultra: 2
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const config = particleConfigs[theme] || particleConfigs.default;
    const multiplier = intensityMultipliers[intensity] || 1;
    const particleCount = Math.floor(config.count * multiplier);

    // Clear existing particles
    particlesRef.current.forEach(particle => {
      if (particle.element && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    particlesRef.current = [];

    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      createParticle(config, i);
    }

    return () => {
      // Cleanup
      particlesRef.current.forEach(particle => {
        if (particle.timeline) {
          particle.timeline.kill();
        }
        if (particle.element && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
      particlesRef.current = [];
    };
  }, [theme, intensity]);

  const createParticle = (config, index) => {
    const particle = document.createElement('div');
    particle.className = styles.particle;
    
    const size = config.sizes[Math.floor(Math.random() * config.sizes.length)];
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    
    // Add glow effect for certain particles
    if (Math.random() < 0.3) {
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      particle.classList.add(styles.glowing);
    }
    
    containerRef.current.appendChild(particle);
    
    // Create animation timeline
    const timeline = gsap.timeline({ repeat: -1 });
    
    // Floating animation
    timeline.to(particle, {
      duration: 4 + Math.random() * 4,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 360,
      ease: "none",
      repeat: -1,
      yoyo: true
    });
    
    // Opacity animation
    timeline.to(particle, {
      duration: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    }, 0);
    
    // Scale animation for pulsing effect
    if (Math.random() < 0.4) {
      timeline.to(particle, {
        duration: 1 + Math.random() * 2,
        scale: 0.5 + Math.random() * 0.5,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      }, Math.random() * 2);
    }
    
    particlesRef.current.push({
      element: particle,
      timeline
    });
  };

  const createInteractiveParticle = (x, y) => {
    const config = particleConfigs[theme] || particleConfigs.default;
    const particle = document.createElement('div');
    particle.className = `${styles.particle} ${styles.interactive}`;
    
    const size = 8;
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.position = 'absolute';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    
    containerRef.current.appendChild(particle);
    
    // Animate the interactive particle
    gsap.to(particle, {
      duration: 1.5,
      scale: 2,
      opacity: 0,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      ease: "power2.out",
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
    });
  };

  const handleMouseMove = (e) => {
    if (Math.random() < 0.1) { // 10% chance to create particle on mouse move
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createInteractiveParticle(x, y);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.particleContainer} ${styles[theme]}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background gradient based on theme */}
      <div className={`${styles.background} ${styles[`bg-${theme}`]}`}></div>
    </div>
  );
}
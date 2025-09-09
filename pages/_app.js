import '../styles/globals.css';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import NavbarNew from '../components/NavbarNew';
import Footer from '../components/Footer';
import ParticleSystem from '../components/ParticleSystem';
import Lenis from 'lenis';

function MyApp({ Component, pageProps }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Always use dark theme
    document.body.className = 'dark';

    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="app dark">
      <ParticleSystem theme="cosmic" intensity="medium" />
      <NavbarNew />
      <div className="page-content" style={{ paddingTop: '70px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Component {...pageProps} />
        <Footer />
      </div>
    </div>
  );
}

export default MyApp;
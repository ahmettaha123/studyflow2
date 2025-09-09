import { useEffect, useRef, useState } from 'react';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize audio context
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Audio context not supported');
      }
    }

    // Load sound preference
    const savedPreference = localStorage.getItem('studyflow-sound-enabled');
    if (savedPreference !== null) {
      setSoundEnabled(JSON.parse(savedPreference));
    }
  }, []);

  const playSound = (type, volume = 0.3) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const sounds = {
      click: { frequency: 800, duration: 0.1, type: 'sine' },
      hover: { frequency: 600, duration: 0.05, type: 'sine' },
      success: { frequency: 523, duration: 0.2, type: 'triangle' },
      error: { frequency: 200, duration: 0.3, type: 'sawtooth' },
      notification: { frequency: 880, duration: 0.15, type: 'sine' }
    };

    const sound = sounds[type] || sounds.click;

    oscillator.frequency.setValueAtTime(sound.frequency, ctx.currentTime);
    oscillator.type = sound.type;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + sound.duration);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('studyflow-sound-enabled', JSON.stringify(newState));
    
    if (newState) {
      playSound('success');
    }
  };

  return {
    playSound,
    soundEnabled,
    toggleSound
  };
};

export default useSoundEffects;
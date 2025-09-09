import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useTheme } from './ThemeProvider';
import styles from '../styles/ThemeSelector.module.css';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, accentColor, themes, accentColors, setTheme, setAccent } = useTheme();
  const dropdownRef = useRef(null);

  const themeIcons = {
    dark: '🌙',
    light: '☀️',
    cosmic: '🌌',
    nature: '🌿',
    sunset: '🌅'
  };

  const accentIcons = {
    blue: '🔵',
    purple: '🟣',
    green: '🟢',
    orange: '🟠',
    pink: '🩷',
    red: '🔴'
  };

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    
    // Add theme change animation
    gsap.to(document.body, {
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Theme change completed
      }
    });
    
    setIsOpen(false);
  };

  const handleAccentChange = (colorName) => {
    setAccent(colorName);
    
    // Add pulse effect to indicate change
    gsap.fromTo(`.${styles.accentOption}[data-color="${colorName}"]`, 
      { scale: 1 },
      { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  };

  return (
    <div className={styles.themeSelector}>
      <button 
        className={styles.themeToggle}
        onClick={() => setIsOpen(!isOpen)}
        title="Tema Değiştir"
      >
        <span className={styles.currentThemeIcon}>
          {themeIcons[currentTheme]}
        </span>
        <span className={styles.chevron}>▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className={styles.overlay} 
            onClick={() => setIsOpen(false)}
          />
          <div ref={dropdownRef} className={styles.dropdown}>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>🎨 Tema Seçin</h4>
              <div className={styles.themeGrid}>
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    className={`${styles.themeOption} ${currentTheme === key ? styles.active : ''}`}
                    onClick={() => handleThemeChange(key)}
                  >
                    <div 
                      className={styles.themePreview}
                      style={{ background: theme.background }}
                    >
                      <span className={styles.themeIcon}>
                        {themeIcons[key]}
                      </span>
                    </div>
                    <span className={styles.themeName}>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>🌈 Vurgu Rengi</h4>
              <div className={styles.accentGrid}>
                {Object.entries(accentColors).map(([key, color]) => (
                  <button
                    key={key}
                    className={`${styles.accentOption} ${accentColor === key ? styles.active : ''}`}
                    onClick={() => handleAccentChange(key)}
                    data-color={key}
                    style={{ backgroundColor: color }}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                  >
                    <span className={styles.accentIcon}>
                      {accentIcons[key]}
                    </span>
                    {accentColor === key && (
                      <div className={styles.checkmark}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <small>Ayarlarınız otomatik kaydedilir</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
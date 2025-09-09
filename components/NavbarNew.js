import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabase';
import styles from '../styles/NavbarNew.module.css';

export default function NavbarNew() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  // GSAP refs for animations
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const indicatorRef = useRef(null);

  // Navigation items with modern icons and descriptions
  const navItems = [
    {
      name: 'Ana Sayfa',
      path: '/',
      icon: '🏠',
      gradient: 'from-blue-400 to-purple-500',
      description: 'Dashboard ve genel bakış'
    },
    {
      name: 'Hedefler',
      path: '/hedefler',
      icon: '🎯',
      gradient: 'from-green-400 to-blue-500',
      description: 'Hedeflerinizi takip edin'
    },
    {
      name: 'Deneme Takip',
      path: '/deneme-takip',
      icon: '📊',
      gradient: 'from-orange-400 to-red-500',
      description: 'Sınav sonuçları ve istatistikler'
    },
    {
      name: 'Analiz',
      path: '/analiz',
      icon: '📈',
      gradient: 'from-purple-400 to-pink-500',
      description: 'Detaylı performans analizi'
    },
    {
      name: 'Pomodoro',
      path: '/pomodoro',
      icon: '⏰',
      gradient: 'from-red-400 to-orange-500',
      description: 'Odaklanma ve verimlilik'
    },
    {
      name: 'Takvim',
      path: '/takvim',
      icon: '📅',
      gradient: 'from-cyan-400 to-blue-500',
      description: 'Program ve etkinlik yönetimi'
    }
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Scroll event for dynamic navbar behavior
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // GSAP animation timeline for navbar entrance
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(logoRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    )
    .fromTo(menuRef.current?.children || [],
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      "-=0.3"
    );

    // Set active section based on current route
    setActiveSection(router.pathname);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener?.subscription?.unsubscribe();
    };
  }, [router.pathname]);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      // Animate menu open with enhanced effects
      const tl = gsap.timeline();
      
      tl.fromTo(`.${styles.mobileMenu}`,
        { 
          height: 0, 
          opacity: 0,
          scale: 0.95,
          y: -20
        },
        { 
          height: 'auto', 
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5, 
          ease: "power3.out" 
        }
      )
      .fromTo(`.${styles.mobileNavItem}`,
        { x: -30, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.3, 
          stagger: 0.1, 
          ease: "power2.out" 
        },
        "-=0.3"
      )
      .fromTo(`.${styles.mobileUserActions}`,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4, 
          ease: "power2.out" 
        },
        "-=0.2"
      );
    } else {
      // Animate menu close
      gsap.to(`.${styles.mobileMenu}`, {
        height: 0,
        opacity: 0,
        scale: 0.95,
        y: -10,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };

  const handleNavClick = (path) => {
    setActiveSection(path);
    setIsMenuOpen(false);
    
    // Enhanced click animation
    gsap.to(`.${styles.mobileMenu}`, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
    
    // Animate indicator movement
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: Math.random() * 200,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    
    if (!isProfileOpen) {
      gsap.fromTo(profileRef.current,
        { scale: 0, y: -20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  };

  return (
    <nav 
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.container}>
        {/* Logo Section with Animation */}
        <div ref={logoRef} className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>
              <span className={styles.logoEmoji}>🎓</span>
              <div className={styles.logoRipple}></div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.brandName}>StudyFlow</span>
              <span className={styles.brandTagline}>YKS Hazırlık</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div ref={menuRef} className={styles.desktopNav}>
          <div className={styles.navItems}>
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${activeSection === item.path ? styles.active : ''}`}
                onClick={() => handleNavClick(item.path)}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget.querySelector(`.${styles.navIcon}`), {
                    scale: 1.2,
                    rotation: 5,
                    duration: 0.2
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget.querySelector(`.${styles.navIcon}`), {
                    scale: 1,
                    rotation: 0,
                    duration: 0.2
                  });
                }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.name}</span>
                <div className={styles.navTooltip}>
                  <span>{item.description}</span>
                </div>
                {activeSection === item.path && (
                  <div className={`${styles.activeIndicator} bg-gradient-to-r ${item.gradient}`}></div>
                )}
              </Link>
            ))}
          </div>
          <div ref={indicatorRef} className={styles.floatingIndicator}></div>
        </div>

        {/* User Actions */}
        <div className={styles.userActions}>
          {user ? (
            <div className={styles.userSection}>
              {/* User Profile */}
              <div className={styles.profileWrapper}>
                <button 
                  className={styles.profileBtn}
                  onClick={toggleProfile}
                >
                  <div className={styles.avatar}>
                    <span className={styles.avatarText}>
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                    <div className={styles.statusIndicator}></div>
                  </div>
                  <span className={styles.chevron}>▼</span>
                </button>

                {isProfileOpen && (
                  <div ref={profileRef} className={styles.profileDropdown}>
                    <div className={styles.profileHeader}>
                      <div className={styles.profileAvatar}>
                        <span>{user.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className={styles.profileInfo}>
                        <div className={styles.profileName}>
                          {user.user_metadata?.name || 'Kullanıcı'}
                        </div>
                        <div className={styles.profileEmail}>{user.email}</div>
                      </div>
                    </div>
                    
                    <div className={styles.profileActions}>
                      <button 
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                      >
                        <span>🚪</span> Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/auth" className={styles.loginBtn}>
              <span className={styles.loginIcon}>🔐</span>
              <span>Giriş Yap</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileToggle}
            onClick={toggleMobileMenu}
          >
            <div className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileHeader}>
              <div className={styles.mobileHeaderContent}>
                <div className={styles.mobileTitle}>
                  <span className={styles.mobileTitleIcon}>🎯</span>
                  <span className={styles.mobileTitleText}>Menü</span>
                </div>
                <button 
                  className={styles.mobileClose}
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1.1,
                      rotation: 90,
                      duration: 0.2
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1,
                      rotation: 0,
                      duration: 0.2
                    });
                  }}
                >
                  <span className={styles.closeIcon}>✕</span>
                </button>
              </div>
              <div className={styles.mobileHeaderSubtitle}>
                Hızlı erişim için menüden seçin
              </div>
            </div>
            
            <div className={styles.mobileNavItems}>
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.mobileNavItem} ${activeSection === item.path ? styles.active : ''}`}
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget.querySelector(`.${styles.mobileIcon}`), {
                      scale: 1.15,
                      rotation: 5,
                      duration: 0.2
                    });
                    gsap.to(e.currentTarget, {
                      x: 8,
                      duration: 0.3,
                      ease: "power2.out"
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget.querySelector(`.${styles.mobileIcon}`), {
                      scale: 1,
                      rotation: 0,
                      duration: 0.2
                    });
                    gsap.to(e.currentTarget, {
                      x: 0,
                      duration: 0.3,
                      ease: "power2.out"
                    });
                  }}
                >
                  <div className={styles.mobileItemContent}>
                    <div className={styles.mobileIconWrapper}>
                      <span className={styles.mobileIcon}>{item.icon}</span>
                      <div className={styles.mobileIconGlow}></div>
                    </div>
                    <div className={styles.mobileItemText}>
                      <span className={styles.mobileLabel}>{item.name}</span>
                      <span className={styles.mobileDescription}>{item.description}</span>
                    </div>
                  </div>
                  <div className={styles.mobileItemArrow}>
                    <span className={styles.arrowIcon}>→</span>
                  </div>
                  {activeSection === item.path && (
                    <div className={styles.mobileActiveIndicator}>
                      <div className={styles.activeGlow}></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {user && (
              <div className={styles.mobileUserActions}>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserAvatar}>
                    <span>{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={styles.mobileUserDetails}>
                    <span className={styles.mobileUserName}>
                      {user.user_metadata?.name || 'Kullanıcı'}
                    </span>
                    <span className={styles.mobileUserEmail}>{user.email}</span>
                  </div>
                </div>
                
                <div className={styles.mobileActionButtons}>
                  <button 
                    className={`${styles.mobileAction} ${styles.logoutAction}`}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1.05,
                        duration: 0.2
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1,
                        duration: 0.2
                      });
                    }}
                  >
                    <span className={styles.actionIcon}>🚪</span>
                    <span>Çıkış Yap</span>
                    <span className={styles.actionArrow}>→</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className={styles.mobileMenuFooter}>
              <div className={styles.footerWave}></div>
              <span className={styles.footerText}>StudyFlow © 2024</span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Background Particles */}
      <div className={styles.particlesContainer}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>
    </nav>
  );
}
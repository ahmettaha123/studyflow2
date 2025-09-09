import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSoundEffects from '../hooks/useSoundEffects'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()
  const observerRef = useRef(null)
  const { playSound } = useSoundEffects()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Always enable dark mode
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')

    // Scroll animation handler
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrollY(scrollY)
      
      // Update CSS custom property for parallax effect
      document.documentElement.style.setProperty('--scroll-y', scrollY)
    }

    window.addEventListener('scroll', handleScroll)

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observe all elements with animateOnScroll class
    const animatedElements = document.querySelectorAll(`.${styles.animateOnScroll}`)
    animatedElements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Dark mode is always enabled - no toggle needed

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>StudyFlow Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>StudyFlow - YKS Hazırlık Platformu</title>
        <meta name="description" content="YKS sınavına hazırlık için en kapsamlı platform. Deneme takibi, analiz, hedefler ve daha fazlası." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroWelcome}>
              <div className={styles.welcomeBadge}>
                <span>🎯 YKS Hazırlık Platformu</span>
              </div>
              <h1 className={styles.heroTitle}>
                Başarıya Giden Yolda <span className={styles.highlight}>Yanındayız</span>
              </h1>
              <p className={styles.heroSubtitle}>
                StudyFlow ile YKS hazırlık sürecinizi organize edin, ilerlemenizi takip edin ve hedeflerinize ulaşın.
              </p>
              
              {user ? (
                <div className={styles.userWelcome}>
                  <h2 className={styles.userGreeting}>Hoş geldin, {user.email?.split('@')[0]}! 👋</h2>
                  <p className={styles.userSubtext}>Bugün hangi hedefe odaklanacaksın?</p>
                </div>
              ) : (
                <div className={styles.heroActions}>
                  <Link href="/auth" className={styles.primaryButton}>
                    <span>🚀 Hemen Başla</span>
                  </Link>
                  <div className={styles.heroNote}>
                    <span>✨ Ücretsiz hesap oluştur, hemen kullanmaya başla</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className={styles.mainContent}>
        <div className={styles.container}>
          {user ? (
            <>
              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <h2 className={styles.sectionTitle}>Hızlı Erişim</h2>
                <div className={styles.actionGrid}>
                  <Link href="/deneme-takip" className={styles.actionCard}
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}>
                    <div className={styles.actionIcon}>📊</div>
                    <div className={styles.actionContent}>
                      <h3>Deneme Takibi</h3>
                      <p>Sınav sonuçlarınızı kaydedin ve takip edin</p>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  
                  <Link href="/analiz" className={styles.actionCard}
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}>
                    <div className={styles.actionIcon}>📈</div>
                    <div className={styles.actionContent}>
                      <h3>Performans Analizi</h3>
                      <p>Detaylı analiz raporlarınızı görüntüleyin</p>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  
                  <Link href="/hedefler" className={styles.actionCard}
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}>
                    <div className={styles.actionIcon}>🎯</div>
                    <div className={styles.actionContent}>
                      <h3>Hedefler & Görevler</h3>
                      <p>Hedeflerinizi belirleyin ve görevlerinizi yönetin</p>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  
                  <Link href="/pomodoro" className={styles.actionCard}
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}>
                    <div className={styles.actionIcon}>⏰</div>
                    <div className={styles.actionContent}>
                      <h3>Pomodoro Timer</h3>
                      <p>Verimli çalışma seansları düzenleyin</p>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  
                  <Link href="/takvim" className={styles.actionCard}
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}>
                    <div className={styles.actionIcon}>📅</div>
                    <div className={styles.actionContent}>
                      <h3>Çalışma Takvimi</h3>
                      <p>Çalışma programınızı planlayın</p>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                </div>
              </div>
              
              {/* Dashboard Overview */}
              <div className={styles.dashboardOverview}>
                <h2 className={styles.sectionTitle}>Genel Bakış</h2>
                <div className={styles.overviewGrid}>
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>📊</div>
                    <div className={styles.overviewContent}>
                      <h3>Son Deneme Sonuçları</h3>
                      <p className={styles.overviewValue}>Net: 85.5</p>
                      <p className={styles.overviewSubtext}>Hedefine %75 yaklaştın!</p>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>🎯</div>
                    <div className={styles.overviewContent}>
                      <h3>Aktif Hedefler</h3>
                      <p className={styles.overviewValue}>3 Hedef</p>
                      <p className={styles.overviewSubtext}>2 tamamlandı bu hafta</p>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>⏰</div>
                    <div className={styles.overviewContent}>
                      <h3>Bugünkü Çalışma</h3>
                      <p className={styles.overviewValue}>2.5 Saat</p>
                      <p className={styles.overviewSubtext}>5 Pomodoro tamamlandı</p>
                    </div>
                  </div>
                  
                  <div className={styles.overviewCard}>
                    <div className={styles.overviewIcon}>📈</div>
                    <div className={styles.overviewContent}>
                      <h3>Bu Ay İlerleme</h3>
                      <p className={styles.overviewValue}>+12.3</p>
                      <p className={styles.overviewSubtext}>Net artış ortalaması</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>Neden StudyFlow?</h2>
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📊</div>
                  <h3>Detaylı Analiz</h3>
                  <p>Deneme sonuçlarınızı analiz edin, güçlü ve zayıf yönlerinizi keşfedin</p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🎯</div>
                  <h3>Hedef Odaklı</h3>
                  <p>Hedeflerinizi belirleyin, ilerlemenizi takip edin ve başarıya ulaşın</p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>⏰</div>
                  <h3>Verimli Çalışma</h3>
                  <p>Pomodoro tekniği ile odaklanın, çalışma sürenizi optimize edin</p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📅</div>
                  <h3>Akıllı Planlama</h3>
                  <p>Çalışma programınızı planlayın, zamanınızı en verimli şekilde kullanın</p>
                </div>
              </div>
              
              <div className={styles.ctaSection}>
                <h3>Başarıya Giden Yolculuğa Başla</h3>
                <p>Binlerce öğrenci StudyFlow ile hedeflerine ulaştı. Sıra sende!</p>
                <Link href="/auth" className={styles.ctaButton}>
                  <span>🚀 Ücretsiz Başla</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      
    </div>
  )
}
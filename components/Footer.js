import { useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [quote, setQuote] = useState('');
  
  const motivationalQuotes = [
    "Başarı, hazırlık ile fırsat buluştuğunda ortaya çıkar.",
    "Hedefinize ulaşmanın en iyi yolu, başlamaktır.",
    "Her gün biraz daha yaklaşıyorsun hayallerine.",
    "Zorluklar seni daha güçlü yapar.",
    "Bugünkü mücadelen, yarının başarısıdır.",
    "Vazgeçmek yoksa, başarmak var.",
    "İnanç ve çalışma, başarının anahtarıdır.",
    "Her adım seni hedefe bir adım daha yaklaştırır."
  ];

  useEffect(() => {
    // Random quote selection
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    // Footer entrance animation
    gsap.fromTo(`.${styles.footer}`, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.5 }
    );
  }, []);

  const socialLinks = [
    { name: 'GitHub', icon: '💻', url: '#', color: '#333' },
    { name: 'Twitter', icon: '🐦', url: '#', color: '#1DA1F2' },
    { name: 'Instagram', icon: '📷', url: '#', color: '#E4405F' },
    { name: 'LinkedIn', icon: '💼', url: '#', color: '#0077B5' }
  ];

  const quickLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Deneme Takip', path: '/deneme-takip' },
    { name: 'Hedefler', path: '/hedefler' },
    { name: 'Analiz', path: '/analiz' },
    { name: 'Pomodoro', path: '/pomodoro' },
    { name: 'Takvim', path: '/takvim' }
  ];

  const handleSocialClick = (e, link) => {
    e.preventDefault();
    
    // Add click animation
    gsap.to(e.currentTarget, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
    
    // You can add actual social media links here
    console.log(`Navigating to ${link.name}`);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Logo and Description */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎓</span>
              <span className={styles.logoText}>StudyFlow</span>
            </div>
            <p className={styles.description}>
              YKS hazırlık sürecinizde yanınızdayız. Başarıya giden yolda her adımda destek, analiz ve motivasyon.
            </p>
            <div className={styles.quote}>
              <span className={styles.quoteIcon}>💭</span>
              <em>"{quote}"</em>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Hızlı Erişim</h4>
            <ul className={styles.linksList}>
              {quickLinks.map((link, index) => (
                <li key={link.path}>
                  <Link 
                    href={link.path} 
                    className={styles.footerLink}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        x: 5,
                        duration: 0.2,
                        ease: "power2.out"
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        x: 0,
                        duration: 0.2,
                        ease: "power2.out"
                      });
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Resources */}
          <div className={styles.resourcesSection}>
            <h4 className={styles.sectionTitle}>Çalışma Kaynakları</h4>
            <ul className={styles.linksList}>
              <li>
                <a href="#" className={styles.footerLink}>📚 YKS Rehberi</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>📊 Başarı İpuçları</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>⏰ Çalışma Teknikleri</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>🎯 Motivasyon</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>❓ Sık Sorulan Sorular</a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className={styles.contactSection}>
            <h4 className={styles.sectionTitle}>İletişim</h4>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                destek@studyflow.com
              </p>
              <p className={styles.contactItem}>
                <span className={styles.contactIcon}>📱</span>
                +90 (555) 123-4567
              </p>
            </div>
            
            <div className={styles.socialMedia}>
              <h5 className={styles.socialTitle}>Bizi Takip Edin</h5>
              <div className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className={styles.socialLink}
                    style={{ '--social-color': social.color }}
                    onClick={(e) => handleSocialClick(e, social)}
                    title={social.name}
                  >
                    <span className={styles.socialIcon}>{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} StudyFlow. Tüm hakları saklıdır. 
              <span className={styles.heart}>❤️</span> 
              YKS öğrencileri için geliştirilmiştir.
            </p>
          </div>
          
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Gizlilik Politikası</a>
            <span className={styles.separator}>•</span>
            <a href="#" className={styles.bottomLink}>Kullanım Şartları</a>
            <span className={styles.separator}>•</span>
            <a href="#" className={styles.bottomLink}>Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
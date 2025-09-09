import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { db, auth } from '../lib/supabase';
import styles from '../styles/Pomodoro.module.css';

export default function Pomodoro() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    work_duration: 25,
    short_break: 5,
    long_break: 15,
    sessions_until_long_break: 4,
    auto_start_breaks: false,
    auto_start_work: false,
    sound_enabled: true
  });
  
  const [currentSession, setCurrentSession] = useState('work'); // 'work', 'short_break', 'long_break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [currentSubject, setCurrentSubject] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [studyStats, setStudyStats] = useState({
    today: { sessions: 0, totalMinutes: 0, subjects: {} },
    week: { sessions: 0, totalMinutes: 0, subjects: {} },
    month: { sessions: 0, totalMinutes: 0, subjects: {} }
  });
  const [showStats, setShowStats] = useState(false);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Kullanıcı durumunu kontrol et
    const checkUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        loadSettings(currentUser.id);
        loadStudyStats(currentUser.id);
      }
    };
    
    checkUser();
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadSettings(session.user.id);
        loadStudyStats(session.user.id);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    // Sayfa kapatıldığında zamanlayıcıyı durdur
    const handleBeforeUnload = () => {
      if (isRunning) {
        localStorage.setItem('pomodoroState', JSON.stringify({
          currentSession,
          timeLeft,
          sessionCount,
          totalStudyTime,
          currentSubject,
          timestamp: Date.now()
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Sayfa açıldığında durumu geri yükle
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      const state = JSON.parse(savedState);
      const timePassed = Math.floor((Date.now() - state.timestamp) / 1000);
      const newTimeLeft = Math.max(0, state.timeLeft - timePassed);
      
      if (newTimeLeft > 0) {
        setCurrentSession(state.currentSession);
        setTimeLeft(newTimeLeft);
        setSessionCount(state.sessionCount);
        setTotalStudyTime(state.totalStudyTime);
        setCurrentSubject(state.currentSubject);
      }
      
      localStorage.removeItem('pomodoroState');
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);
  
  const loadSettings = async (userId) => {
    // Burada Supabase'den ayarları yükleyeceğiz
    // Şimdilik varsayılan ayarları kullanıyoruz
  };
  
  const loadStudyStats = async (userId) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Bugünkü veriler
      const { data: todayData } = await db.studySessions.getByUserId(userId, startOfDay.toISOString(), today.toISOString());
      
      // Haftalık veriler
      const { data: weekData } = await db.studySessions.getByUserId(userId, startOfWeek.toISOString(), today.toISOString());
      
      // Aylık veriler
      const { data: monthData } = await db.studySessions.getByUserId(userId, startOfMonth.toISOString(), today.toISOString());
      
      const calculateStats = (sessions) => {
        const stats = { sessions: 0, totalMinutes: 0, subjects: {} };
        if (sessions) {
          sessions.forEach(session => {
            stats.sessions += 1;
            stats.totalMinutes += session.duration_minutes;
            stats.subjects[session.subject] = (stats.subjects[session.subject] || 0) + session.duration_minutes;
          });
        }
        return stats;
      };
      
      setStudyStats({
        today: calculateStats(todayData),
        week: calculateStats(weekData),
        month: calculateStats(monthData)
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };
  
  const saveSettings = async () => {
    if (!user) return;
    
    // Burada ayarları Supabase'e kaydedeceğiz
    alert('Ayarlar kaydedildi!');
    setShowSettings(false);
  };
  
  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (settings.sound_enabled) {
      playNotificationSound();
    }
    
    if (currentSession === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      setTotalStudyTime(prev => prev + settings.work_duration);
      
      // Çalışma seansını kaydet
      if (user && currentSubject) {
        saveStudySession();
      }
      
      // Mola türünü belirle
      if (newSessionCount % settings.sessions_until_long_break === 0) {
        setCurrentSession('long_break');
        setTimeLeft(settings.long_break * 60);
      } else {
        setCurrentSession('short_break');
        setTimeLeft(settings.short_break * 60);
      }
      
      if (settings.auto_start_breaks) {
        setIsRunning(true);
      }
    } else {
      // Mola bitti, çalışmaya dön
      setCurrentSession('work');
      setTimeLeft(settings.work_duration * 60);
      
      if (settings.auto_start_work) {
        setIsRunning(true);
      }
    }
  };
  
  const saveStudySession = async () => {
    if (!user || !currentSubject) return;
    
    const sessionData = {
      user_id: user.id,
      subject: currentSubject,
      duration_minutes: settings.work_duration,
      session_type: 'pomodoro'
    };
    
    const { data, error } = await db.studySessions.create(sessionData);
    
    if (!error && data) {
      // İstatistikleri güncelle
      loadStudyStats(user.id);
      
      // Yerel istatistikleri de güncelle
      setStudyStats(prev => ({
        ...prev,
        today: {
          ...prev.today,
          sessions: prev.today.sessions + 1,
          totalMinutes: prev.today.totalMinutes + settings.work_duration,
          subjects: {
            ...prev.today.subjects,
            [currentSubject]: (prev.today.subjects[currentSubject] || 0) + settings.work_duration
          }
        }
      }));
    }
  };
  
  const playNotificationSound = () => {
    // Basit bir beep sesi oluştur
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  const startTimer = () => {
    if (currentSession === 'work' && !currentSubject) {
      alert('Lütfen çalışacağınız dersi seçin.');
      return;
    }
    setIsRunning(true);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    if (currentSession === 'work') {
      setTimeLeft(settings.work_duration * 60);
    } else if (currentSession === 'short_break') {
      setTimeLeft(settings.short_break * 60);
    } else {
      setTimeLeft(settings.long_break * 60);
    }
  };
  
  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getSessionTitle = () => {
    switch (currentSession) {
      case 'work':
        return 'Çalışma Zamanı';
      case 'short_break':
        return 'Kısa Mola';
      case 'long_break':
        return 'Uzun Mola';
      default:
        return 'Pomodoro';
    }
  };
  
  const getProgressPercentage = () => {
    let totalTime;
    switch (currentSession) {
      case 'work':
        totalTime = settings.work_duration * 60;
        break;
      case 'short_break':
        totalTime = settings.short_break * 60;
        break;
      case 'long_break':
        totalTime = settings.long_break * 60;
        break;
      default:
        totalTime = 25 * 60;
    }
    return ((totalTime - timeLeft) / totalTime) * 100;
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Pomodoro Zamanlayıcısı - StudyFlow</title>
        <meta name="description" content="Verimli çalışma için Pomodoro tekniği" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Pomodoro Zamanlayıcısı</h1>
        
        <div className={styles.pomodoroContainer}>
          {/* Ana Zamanlayıcı */}
          <div className={`${styles.timerCard} ${styles[currentSession]}`}>
            <h2 className={styles.sessionTitle}>{getSessionTitle()}</h2>
            
            {/* Dairesel Progress Bar */}
            <div className={styles.circularProgress}>
              <svg className={styles.progressRing} width="200" height="200">
                <circle
                  className={styles.progressRingBackground}
                  stroke="var(--border-color)"
                  strokeWidth="8"
                  fill="transparent"
                  r="90"
                  cx="100"
                  cy="100"
                />
                <circle
                  className={styles.progressRingForeground}
                  stroke={currentSession === 'work' ? 'var(--accent-primary)' : 'var(--success)'}
                  strokeWidth="8"
                  fill="transparent"
                  r="90"
                  cx="100"
                  cy="100"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgressPercentage() / 100)}`}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className={styles.timeDisplay}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* Kontrol Butonları */}
            <div className={styles.controls}>
              {!isRunning ? (
                <button onClick={startTimer} className={`${styles.controlBtn} ${styles.startBtn}`}>
                  ▶️ Başlat
                </button>
              ) : (
                <button onClick={pauseTimer} className={`${styles.controlBtn} ${styles.pauseBtn}`}>
                  ⏸️ Duraklat
                </button>
              )}
              
              <button onClick={resetTimer} className={`${styles.controlBtn} ${styles.resetBtn}`}>
                🔄 Sıfırla
              </button>
              
              <button onClick={skipSession} className={`${styles.controlBtn} ${styles.skipBtn}`}>
                ⏭️ Geç
              </button>
            </div>
          </div>
          
          {/* Ders Seçimi */}
          {currentSession === 'work' && (
            <div className={styles.subjectCard}>
              <h3>Çalışılacak Ders</h3>
              <select
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                className={styles.subjectSelect}
              >
                <option value="">Ders Seçin</option>
                <option value="Matematik">Matematik</option>
                <option value="Türkçe">Türkçe</option>
                <option value="Fizik">Fizik</option>
                <option value="Kimya">Kimya</option>
                <option value="Biyoloji">Biyoloji</option>
                <option value="Tarih">Tarih</option>
                <option value="Coğrafya">Coğrafya</option>
                <option value="Edebiyat">Edebiyat</option>
                <option value="Felsefe">Felsefe</option>
                <option value="Din Kültürü">Din Kültürü</option>
              </select>
            </div>
          )}
          
          {/* Anlık İstatistikler */}
          <div className={styles.statsCard}>
            <h3>Anlık Durum</h3>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Bu Oturumdaki Seans:</span>
                <span className={styles.statValue}>{sessionCount}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Bu Oturumdaki Süre:</span>
                <span className={styles.statValue}>{Math.floor(totalStudyTime / 60)}s {totalStudyTime % 60}dk</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Sonraki Uzun Mola:</span>
                <span className={styles.statValue}>
                  {settings.sessions_until_long_break - (sessionCount % settings.sessions_until_long_break)} seans sonra
                </span>
              </div>
            </div>
          </div>
          
          {/* Detaylı İstatistikler */}
          <div className={styles.detailedStatsCard}>
            <button
              onClick={() => setShowStats(!showStats)}
              className={styles.statsToggle}
            >
              📊 Çalışma İstatistikleri
            </button>
            
            {showStats && (
              <div className={styles.statsPanel}>
                <div className={styles.statsPeriods}>
                  <div className={styles.statsPeriod}>
                    <h4>📅 Bugün</h4>
                    <div className={styles.periodStats}>
                      <div className={styles.periodStat}>
                        <span>Seans:</span>
                        <span>{studyStats.today.sessions}</span>
                      </div>
                      <div className={styles.periodStat}>
                        <span>Süre:</span>
                        <span>{Math.floor(studyStats.today.totalMinutes / 60)}s {studyStats.today.totalMinutes % 60}dk</span>
                      </div>
                    </div>
                    {Object.keys(studyStats.today.subjects).length > 0 && (
                      <div className={styles.subjectBreakdown}>
                        <h5>Ders Dağılımı:</h5>
                        {Object.entries(studyStats.today.subjects).map(([subject, minutes]) => (
                          <div key={subject} className={styles.subjectStat}>
                            <span>{subject}:</span>
                            <span>{Math.floor(minutes / 60)}s {minutes % 60}dk</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.statsPeriod}>
                    <h4>📈 Bu Hafta</h4>
                    <div className={styles.periodStats}>
                      <div className={styles.periodStat}>
                        <span>Seans:</span>
                        <span>{studyStats.week.sessions}</span>
                      </div>
                      <div className={styles.periodStat}>
                        <span>Süre:</span>
                        <span>{Math.floor(studyStats.week.totalMinutes / 60)}s {studyStats.week.totalMinutes % 60}dk</span>
                      </div>
                    </div>
                    {Object.keys(studyStats.week.subjects).length > 0 && (
                      <div className={styles.subjectBreakdown}>
                        <h5>Ders Dağılımı:</h5>
                        {Object.entries(studyStats.week.subjects)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([subject, minutes]) => (
                          <div key={subject} className={styles.subjectStat}>
                            <span>{subject}:</span>
                            <span>{Math.floor(minutes / 60)}s {minutes % 60}dk</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.statsPeriod}>
                    <h4>📊 Bu Ay</h4>
                    <div className={styles.periodStats}>
                      <div className={styles.periodStat}>
                        <span>Seans:</span>
                        <span>{studyStats.month.sessions}</span>
                      </div>
                      <div className={styles.periodStat}>
                        <span>Süre:</span>
                        <span>{Math.floor(studyStats.month.totalMinutes / 60)}s {studyStats.month.totalMinutes % 60}dk</span>
                      </div>
                      <div className={styles.periodStat}>
                        <span>Günlük Ort:</span>
                        <span>{Math.floor((studyStats.month.totalMinutes / new Date().getDate()) / 60)}s {Math.floor((studyStats.month.totalMinutes / new Date().getDate()) % 60)}dk</span>
                      </div>
                    </div>
                    {Object.keys(studyStats.month.subjects).length > 0 && (
                      <div className={styles.subjectBreakdown}>
                        <h5>En Çok Çalışılan Dersler:</h5>
                        {Object.entries(studyStats.month.subjects)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([subject, minutes]) => (
                          <div key={subject} className={styles.subjectStat}>
                            <span>{subject}:</span>
                            <span>{Math.floor(minutes / 60)}s {minutes % 60}dk</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {studyStats.month.totalMinutes > 0 && (
                  <div className={styles.motivationSection}>
                    <h4>🎯 Motivasyon</h4>
                    <div className={styles.achievements}>
                      {studyStats.today.sessions >= 4 && (
                        <div className={styles.achievement}>🔥 Bugün 4+ seans tamamladın!</div>
                      )}
                      {studyStats.week.totalMinutes >= 300 && (
                        <div className={styles.achievement}>⭐ Bu hafta 5+ saat çalıştın!</div>
                      )}
                      {studyStats.month.sessions >= 50 && (
                        <div className={styles.achievement}>🏆 Bu ay 50+ seans tamamladın!</div>
                      )}
                      {Object.keys(studyStats.today.subjects).length >= 3 && (
                        <div className={styles.achievement}>📚 Bugün 3+ farklı ders çalıştın!</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Ayarlar */}
          <div className={styles.settingsCard}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={styles.settingsToggle}
            >
              ⚙️ Ayarlar
            </button>
            
            {showSettings && (
              <div className={styles.settingsPanel}>
                <div className={styles.settingItem}>
                  <label>Çalışma Süresi (dakika):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.work_duration}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value) || 25;
                      setSettings(prev => ({ ...prev, work_duration: newDuration }));
                      if (currentSession === 'work' && !isRunning) {
                        setTimeLeft(newDuration * 60);
                      }
                    }}
                    className={styles.settingInput}
                  />
                </div>
                
                <div className={styles.settingItem}>
                  <label>Kısa Mola (dakika):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.short_break}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value) || 5;
                      setSettings(prev => ({ ...prev, short_break: newDuration }));
                      if (currentSession === 'short_break' && !isRunning) {
                        setTimeLeft(newDuration * 60);
                      }
                    }}
                    className={styles.settingInput}
                  />
                </div>
                
                <div className={styles.settingItem}>
                  <label>Uzun Mola (dakika):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.long_break}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value) || 15;
                      setSettings(prev => ({ ...prev, long_break: newDuration }));
                      if (currentSession === 'long_break' && !isRunning) {
                        setTimeLeft(newDuration * 60);
                      }
                    }}
                    className={styles.settingInput}
                  />
                </div>
                
                <div className={styles.settingItem}>
                  <label>Uzun Molaya Kadar Seans:</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.sessions_until_long_break}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessions_until_long_break: parseInt(e.target.value) || 4 }))}
                    className={styles.settingInput}
                  />
                </div>
                
                <div className={styles.checkboxItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.auto_start_breaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, auto_start_breaks: e.target.checked }))}
                    />
                    Molaları otomatik başlat
                  </label>
                </div>
                
                <div className={styles.checkboxItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.auto_start_work}
                      onChange={(e) => setSettings(prev => ({ ...prev, auto_start_work: e.target.checked }))}
                    />
                    Çalışmayı otomatik başlat
                  </label>
                </div>
                
                <div className={styles.checkboxItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.sound_enabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, sound_enabled: e.target.checked }))}
                    />
                    Ses bildirimleri
                  </label>
                </div>
                
                <button onClick={saveSettings} className={styles.saveBtn}>
                  Ayarları Kaydet
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
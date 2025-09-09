import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { calculateTYTScore, calculateAYTScore, calculateYerlestirmePuani, calculateOBP } from '../utils/yksCalculator';
import styles from '../styles/Analiz.module.css';

export default function Analiz() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'last3', 'last6', 'last10'
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all', 'matematik', 'turkce', etc.
  const [chartType, setChartType] = useState('line'); // 'line', 'bar'
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);
      
      if (currentUser) {
        await loadExams(currentUser.id);
      }
      setLoading(false);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadExams(session.user.id);
      } else {
        setExams([]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const loadExams = async (userId) => {
    try {
      console.log('Sınavlar yükleniyor, userId:', userId);
      const { data: examData, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', userId)
        .order('exam_date', { ascending: false });
      
      console.log('Supabase sorgu sonucu:', { examData, error });
      
      if (error) {
        console.error('Exam data loading error:', error);
        setError(`Sınavlar yüklenirken bir hata oluştu: ${error.message}`);
        setExams([]);
        return;
      }
      
      if (!examData || examData.length === 0) {
        console.log('Hiç sınav verisi bulunamadı');
        setExams([]);
        setError('Henüz hiç deneme sınavı kaydınız bulunmuyor. Deneme Takibi sayfasından sınav ekleyebilirsiniz.');
        return;
      }
      
      // Sınavları tarihe göre sırala (en yeni önce)
      const sortedExams = examData.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
      
      // Her sınav için puanları hesapla
        const examsWithScores = sortedExams.map(exam => {
          // Veritabanından gelen verileri doğru formata çevir
          const tytAnswers = {
            turkce_dogru: exam.tyt_turkce_dogru || 0,
            turkce_yanlis: exam.tyt_turkce_yanlis || 0,
            matematik_dogru: exam.tyt_matematik_dogru || 0,
            matematik_yanlis: exam.tyt_matematik_yanlis || 0,
            fen_dogru: exam.tyt_fen_dogru || 0,
            fen_yanlis: exam.tyt_fen_yanlis || 0,
            sosyal_dogru: exam.tyt_sosyal_dogru || 0,
            sosyal_yanlis: exam.tyt_sosyal_yanlis || 0
          };
          
          const aytAnswers = {
            matematik_dogru: exam.ayt_matematik_dogru || 0,
            matematik_yanlis: exam.ayt_matematik_yanlis || 0,
            fizik_dogru: exam.ayt_fizik_dogru || 0,
            fizik_yanlis: exam.ayt_fizik_yanlis || 0,
            kimya_dogru: exam.ayt_kimya_dogru || 0,
            kimya_yanlis: exam.ayt_kimya_yanlis || 0,
            biyoloji_dogru: exam.ayt_biyoloji_dogru || 0,
            biyoloji_yanlis: exam.ayt_biyoloji_yanlis || 0,
            edebiyat_dogru: exam.ayt_edebiyat_dogru || 0,
            edebiyat_yanlis: exam.ayt_edebiyat_yanlis || 0,
            tarih1_dogru: exam.ayt_tarih1_dogru || 0,
            tarih1_yanlis: exam.ayt_tarih1_yanlis || 0,
            cografya1_dogru: exam.ayt_cografya1_dogru || 0,
            cografya1_yanlis: exam.ayt_cografya1_yanlis || 0,
            tarih2_dogru: exam.ayt_tarih2_dogru || 0,
            tarih2_yanlis: exam.ayt_tarih2_yanlis || 0,
            cografya2_dogru: exam.ayt_cografya2_dogru || 0,
            cografya2_yanlis: exam.ayt_cografya2_yanlis || 0,
            felsefe_dogru: exam.ayt_felsefe_dogru || 0,
            felsefe_yanlis: exam.ayt_felsefe_yanlis || 0,
            din_dogru: exam.ayt_din_dogru || 0,
            din_yanlis: exam.ayt_din_yanlis || 0
          };
          
          const obpData = {
            diplomaNotu: exam.diploma_notu || 85,
            liseType: exam.lise_type || 'anadolu'
          };
          
          // TYT puanını her zaman hesapla
          const tytScore = calculateTYTScore(tytAnswers);
          let aytScore = null;
          let yerlestirmePuani = null;
          
          // AYT verisi var mı kontrol et
          const hasAytData = Object.values(aytAnswers).some(value => value > 0);
          
          if (hasAytData) {
            // AYT hesaplama - exam_type'a göre
            aytScore = calculateAYTScore(aytAnswers, exam.exam_type || 'sayisal');
          } else {
            // AYT verisi yoksa boş obje oluştur
            aytScore = {
              ayt_ham_puan: 0,
              netScore: 0,
              subjects: {}
            };
          }
          
          // OBP hesaplama
           const obp = calculateOBP(obpData.diplomaNotu, obpData.liseType);
           
           // Yerleştirme puanı hesaplama - sadece gerekli veriler varsa
           if (tytScore && tytScore.tyt_ham_puan > 0) {
             yerlestirmePuani = calculateYerlestirmePuani(
               tytScore.tyt_ham_puan,
               aytScore ? aytScore.ayt_ham_puan : 0,
               obp,
               exam.exam_type || 'sayisal'
             );
           } else {
             yerlestirmePuani = 0;
           }
        
        return {
          ...exam,
          tytScore,
          aytScore,
          yerlestirmePuani
        };
      });
      
      setExams(examsWithScores);
      setError(''); // Başarılı yükleme durumunda hatayı temizle
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
      setError('Sınavlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      setExams([]);
    }
  };
  
  const getFilteredExams = () => {
    let filtered = [...exams];
    
    // Dönem filtresi
    if (selectedPeriod !== 'all') {
      const count = parseInt(selectedPeriod.replace('last', ''));
      filtered = filtered.slice(0, count);
    }
    
    return filtered.reverse(); // Grafik için eski tarihten yeniye sırala
  };
  
  const getSubjectData = (subject) => {
    const filteredExams = getFilteredExams();
    
    return filteredExams.map(exam => {
      let value = 0;
      
      switch (subject) {
        case 'tyt_net':
          value = exam.tytScore?.netScore || 0;
          break;
        case 'ayt_net':
          value = exam.aytScore?.netScore || 0;
          break;
        case 'matematik':
          // TYT ve AYT matematik netlerini hesapla
          const tytMatematikNet = ((exam.tyt_matematik_dogru || 0) - ((exam.tyt_matematik_yanlis || 0) * 0.25));
          const aytMatematikNet = ((exam.ayt_matematik_dogru || 0) - ((exam.ayt_matematik_yanlis || 0) * 0.25));
          value = Math.max(0, tytMatematikNet) + Math.max(0, aytMatematikNet);
          break;
        case 'turkce':
          // TYT Türkçe net hesapla
          value = Math.max(0, (exam.tyt_turkce_dogru || 0) - ((exam.tyt_turkce_yanlis || 0) * 0.25));
          break;
        case 'fizik':
          // AYT Fizik net hesapla
          value = Math.max(0, (exam.ayt_fizik_dogru || 0) - ((exam.ayt_fizik_yanlis || 0) * 0.25));
          break;
        case 'kimya':
          // AYT Kimya net hesapla
          value = Math.max(0, (exam.ayt_kimya_dogru || 0) - ((exam.ayt_kimya_yanlis || 0) * 0.25));
          break;
        case 'biyoloji':
          // AYT Biyoloji net hesapla
          value = Math.max(0, (exam.ayt_biyoloji_dogru || 0) - ((exam.ayt_biyoloji_yanlis || 0) * 0.25));
          break;
        case 'yerlestirime_puani':
          value = exam.yerlestirmePuani || 0;
          break;
        default:
          value = exam.tytScore?.netScore || 0;
      }
      
      return {
        date: new Date(exam.exam_date).toLocaleDateString('tr-TR'),
        value: Math.round(value * 100) / 100,
        examName: exam.exam_name
      };
    });
  };
  
  const getStatistics = () => {
    const filteredExams = getFilteredExams();
    if (filteredExams.length === 0) return null;
    
    const tytNets = filteredExams.map(e => e.tytScore?.netScore || 0).filter(n => n > 0);
    const aytNets = filteredExams.map(e => e.aytScore?.netScore || 0).filter(n => n > 0);
    const yerlestirmePuanlari = filteredExams.map(e => e.yerlestirmePuani || 0).filter(p => p > 0);
    
    const calculateStats = (arr) => {
      if (arr.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 };
      
      const avg = arr.reduce((sum, val) => sum + val, 0) / arr.length;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      
      // Trend hesaplama (son 3 sınav ortalaması - ilk 3 sınav ortalaması)
      let trend = 0;
      if (arr.length >= 6) {
        const firstThree = arr.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
        const lastThree = arr.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
        trend = lastThree - firstThree;
      }
      
      return { avg, min, max, trend };
    };
    
    return {
      tyt: calculateStats(tytNets),
      ayt: calculateStats(aytNets),
      yerlestirime: calculateStats(yerlestirmePuanlari),
      totalExams: filteredExams.length
    };
  };
  
  const renderChart = (data, title, color = '#3b82f6') => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <div className={styles.chart}>
          {chartType === 'line' ? (
            <svg className={styles.lineSvg} viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 32}
                  x2="380"
                  y2={40 + i * 32}
                  stroke="var(--border-color)"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map(i => {
                const value = maxValue - (i * range / 4);
                return (
                  <text
                    key={i}
                    x="35"
                    y={45 + i * 32}
                    fontSize="10"
                    fill="var(--text-secondary)"
                    textAnchor="end"
                  >
                    {value.toFixed(1)}
                  </text>
                );
              })}
              
              {/* Line path */}
              {data.length > 1 && (
                <path
                  d={data.map((point, index) => {
                    const x = 50 + (index * 300 / (data.length - 1));
                    const y = 40 + ((maxValue - point.value) / range) * 128;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke={color}
                  strokeWidth="2"
                  fill="none"
                />
              )}
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = 50 + (index * 300 / Math.max(data.length - 1, 1));
                const y = 40 + ((maxValue - point.value) / range) * 128;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={color}
                    />
                    <title>{`${point.examName}: ${point.value}`}</title>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className={styles.barChart}>
              {data.map((point, index) => {
                const height = (point.value / maxValue) * 100;
                return (
                  <div key={index} className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${height}%`,
                        backgroundColor: color
                      }}
                      title={`${point.examName}: ${point.value}`}
                    >
                      <span className={styles.barValue}>{point.value}</span>
                    </div>
                    <span className={styles.barLabel}>{point.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authMessage}>
          <h2>Giriş Yapın</h2>
          <p>Analiz sayfasını görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }
  
  if (exams.length === 0) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Analiz - StudyFlow</title>
          <meta name="description" content="Deneme sınavı sonuçlarınızı analiz edin" />
        </Head>
        
        <main className={styles.main}>
          <h1 className={styles.title}>Performans Analizi</h1>
          <div className={styles.noData}>
            <h2>Henüz Analiz Edilecek Veri Yok</h2>
            <p>Analiz görüntülemek için önce deneme sınavı sonuçlarınızı kaydetmelisiniz.</p>
            <a href="/deneme-takip" className={styles.addExamBtn}>
              İlk Deneme Sınavınızı Ekleyin
            </a>
          </div>
        </main>
      </div>
    );
  }
  
  const stats = getStatistics();
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Analiz - StudyFlow</title>
        <meta name="description" content="Deneme sınavı sonuçlarınızı analiz edin" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Performans Analizi</h1>
        
        {/* Hata Mesajı */}
        {error && (
          <div className={styles.alert + ' ' + styles.alertError}>
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className={styles.closeBtn}>×</button>
          </div>
        )}
        
        {/* Filtreler */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Dönem:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Tüm Sınavlar</option>
              <option value="last3">Son 3 Sınav</option>
              <option value="last6">Son 6 Sınav</option>
              <option value="last10">Son 10 Sınav</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Grafik Türü:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="line">Çizgi Grafik</option>
              <option value="bar">Sütun Grafik</option>
            </select>
          </div>
        </div>
        
        {/* Genel Özet */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2>📊 Genel Performans Özeti</h2>
            <div className={styles.summaryStats}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Toplam Sınav:</span>
                <span className={styles.summaryValue}>{exams.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Son Sınav Tarihi:</span>
                <span className={styles.summaryValue}>
                  {exams.length > 0 ? new Date(exams[0].exam_date).toLocaleDateString('tr-TR') : 'Henüz sınav yok'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Çalışma Süresi:</span>
                <span className={styles.summaryValue}>
                  {exams.length > 0 ? 
                    Math.ceil((new Date() - new Date(exams[exams.length - 1].exam_date)) / (1000 * 60 * 60 * 24)) + ' gün'
                    : '0 gün'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>🎯 TYT Net</h3>
              <div className={styles.statValue}>
                {stats.tyt.avg > 0 ? stats.tyt.avg.toFixed(1) : 
                  (exams.length > 0 && exams.some(e => e.tytScore?.netScore > 0) ? 
                    (exams.filter(e => e.tytScore?.netScore > 0).reduce((sum, e) => sum + e.tytScore.netScore, 0) / 
                     exams.filter(e => e.tytScore?.netScore > 0).length).toFixed(1) : '0.0')
                }
              </div>
              <div className={styles.statLabel}>Ortalama</div>
              <div className={styles.statRange}>
                Min: {stats.tyt.min > 0 ? stats.tyt.min.toFixed(1) : '0.0'} | Max: {stats.tyt.max.toFixed(1)}
              </div>
              <div className={styles.statDetails}>
                <small>📈 Son 3 sınav ort: {exams.slice(0, 3).filter(e => e.tytScore?.netScore > 0).length > 0 ? 
                  (exams.slice(0, 3).filter(e => e.tytScore?.netScore > 0).reduce((sum, e) => sum + e.tytScore.netScore, 0) / 
                   exams.slice(0, 3).filter(e => e.tytScore?.netScore > 0).length).toFixed(1) : '0.0'}</small>
              </div>
              {stats.tyt.trend !== 0 && (
                <div className={`${styles.trend} ${stats.tyt.trend > 0 ? styles.trendUp : styles.trendDown}`}>
                  {stats.tyt.trend > 0 ? '📈' : '📉'} {Math.abs(stats.tyt.trend).toFixed(1)}
                </div>
              )}
            </div>
            
            <div className={styles.statCard}>
              <h3>🎓 AYT Net</h3>
              <div className={styles.statValue}>
                {stats.ayt.avg > 0 ? stats.ayt.avg.toFixed(1) : 
                  (exams.length > 0 && exams.some(e => e.aytScore?.netScore > 0) ? 
                    (exams.filter(e => e.aytScore?.netScore > 0).reduce((sum, e) => sum + e.aytScore.netScore, 0) / 
                     exams.filter(e => e.aytScore?.netScore > 0).length).toFixed(1) : 'Henüz AYT yok')
                }
              </div>
              <div className={styles.statLabel}>Ortalama</div>
              <div className={styles.statRange}>
                Min: {stats.ayt.min > 0 ? stats.ayt.min.toFixed(1) : '0.0'} | Max: {stats.ayt.max.toFixed(1)}
              </div>
              <div className={styles.statDetails}>
                <small>📊 AYT sınav sayısı: {exams.filter(e => e.aytScore?.netScore > 0).length}</small>
              </div>
              {stats.ayt.trend !== 0 && (
                <div className={`${styles.trend} ${stats.ayt.trend > 0 ? styles.trendUp : styles.trendDown}`}>
                  {stats.ayt.trend > 0 ? '📈' : '📉'} {Math.abs(stats.ayt.trend).toFixed(1)}
                </div>
              )}
            </div>
            
            <div className={styles.statCard}>
              <h3>🏆 Yerleştirme Puanı</h3>
              <div className={styles.statValue}>
                {stats.yerlestirime.avg > 0 ? stats.yerlestirime.avg.toFixed(0) : 
                  (exams.length > 0 && exams.some(e => e.yerlestirmePuani > 0) ? 
                    (exams.filter(e => e.yerlestirmePuani > 0).reduce((sum, e) => sum + e.yerlestirmePuani, 0) / 
                     exams.filter(e => e.yerlestirmePuani > 0).length).toFixed(0) : 'Henüz puan yok')
                }
              </div>
              <div className={styles.statLabel}>Ortalama</div>
              <div className={styles.statRange}>
                Min: {stats.yerlestirime.min > 0 ? stats.yerlestirime.min.toFixed(0) : '0'} | Max: {stats.yerlestirime.max.toFixed(0)}
              </div>
              <div className={styles.statDetails}>
                <small>🎯 Hedef: 500+ puan</small>
              </div>
              {stats.yerlestirime.trend !== 0 && (
                <div className={`${styles.trend} ${stats.yerlestirime.trend > 0 ? styles.trendUp : styles.trendDown}`}>
                  {stats.yerlestirime.trend > 0 ? '📈' : '📉'} {Math.abs(stats.yerlestirime.trend).toFixed(0)}
                </div>
              )}
            </div>
            
            <div className={styles.statCard}>
              <h3>📚 Toplam Sınav</h3>
              <div className={styles.statValue}>{stats.totalExams}</div>
              <div className={styles.statLabel}>Adet</div>
              <div className={styles.statDetails}>
                <small>📅 Bu ay: {exams.filter(e => {
                  const examDate = new Date(e.exam_date);
                  const now = new Date();
                  return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear();
                }).length}</small>
              </div>
            </div>
          </div>
        )}
        
        {/* Ders Bazlı Analiz */}
        <div className={styles.subjectAnalysisSection}>
          <div className={styles.subjectAnalysisHeader}>
            <h2>📚 Ders Bazlı Detaylı Analiz</h2>
            <p>Her dersin performansını ayrı ayrı inceleyin ve gelişim alanlarınızı belirleyin</p>
          </div>
          
          <div className={styles.subjectCards}>
            {/* Matematik Analizi */}
            <div className={styles.subjectCard}>
              <div className={styles.subjectHeader}>
                <div className={styles.subjectIcon}>🔢</div>
                <div className={styles.subjectInfo}>
                  <h3>Matematik</h3>
                  <div className={styles.subjectStats}>
                    <span>Ortalama: {getSubjectData('matematik').length > 0 ? (getSubjectData('matematik').reduce((sum, item) => sum + item.value, 0) / getSubjectData('matematik').length).toFixed(1) : '0'} net</span>
                    <span>En yüksek: {getSubjectData('matematik').length > 0 ? Math.max(...getSubjectData('matematik').map(item => item.value)).toFixed(1) : '0'} net</span>
                  </div>
                </div>
              </div>
              <div className={styles.subjectTips}>
                <h4>💡 Matematik İçin Öneriler</h4>
                <ul>
                  <li>Günlük 15-20 soru çözün</li>
                  <li>Yanlış sorularınızı not alın</li>
                  <li>Temel konuları sık sık tekrar edin</li>
                </ul>
              </div>
            </div>
            
            {/* Türkçe Analizi */}
            <div className={styles.subjectCard}>
              <div className={styles.subjectHeader}>
                <div className={styles.subjectIcon}>📖</div>
                <div className={styles.subjectInfo}>
                  <h3>Türkçe</h3>
                  <div className={styles.subjectStats}>
                    <span>Ortalama: {getSubjectData('turkce').length > 0 ? (getSubjectData('turkce').reduce((sum, item) => sum + item.value, 0) / getSubjectData('turkce').length).toFixed(1) : '0'} net</span>
                    <span>En yüksek: {getSubjectData('turkce').length > 0 ? Math.max(...getSubjectData('turkce').map(item => item.value)).toFixed(1) : '0'} net</span>
                  </div>
                </div>
              </div>
              <div className={styles.subjectTips}>
                <h4>💡 Türkçe İçin Öneriler</h4>
                <ul>
                  <li>Günlük okuma alışkanlığı edinin</li>
                  <li>Paragraf sorularına odaklanın</li>
                  <li>Kelime dağarcığınızı geliştirin</li>
                </ul>
              </div>
            </div>
            
            {/* Fen Bilimleri Analizi */}
            <div className={styles.subjectCard}>
              <div className={styles.subjectHeader}>
                <div className={styles.subjectIcon}>🔬</div>
                <div className={styles.subjectInfo}>
                  <h3>Fen Bilimleri</h3>
                  <div className={styles.subjectStats}>
                    <span>Fizik Ort: {getSubjectData('fizik').length > 0 ? (getSubjectData('fizik').reduce((sum, item) => sum + item.value, 0) / getSubjectData('fizik').length).toFixed(1) : '0'}</span>
                    <span>Kimya Ort: {getSubjectData('kimya').length > 0 ? (getSubjectData('kimya').reduce((sum, item) => sum + item.value, 0) / getSubjectData('kimya').length).toFixed(1) : '0'}</span>
                    <span>Biyoloji Ort: {getSubjectData('biyoloji').length > 0 ? (getSubjectData('biyoloji').reduce((sum, item) => sum + item.value, 0) / getSubjectData('biyoloji').length).toFixed(1) : '0'}</span>
                  </div>
                </div>
              </div>
              <div className={styles.subjectTips}>
                <h4>💡 Fen Bilimleri İçin Öneriler</h4>
                <ul>
                  <li>Formülleri ezberlemek yerine anlayın</li>
                  <li>Deney ve grafik sorularına odaklanın</li>
                  <li>Güncel bilimsel gelişmeleri takip edin</li>
                </ul>
              </div>
            </div>
            
            {/* Sosyal Bilimler Analizi */}
            <div className={styles.subjectCard}>
              <div className={styles.subjectHeader}>
                <div className={styles.subjectIcon}>🌍</div>
                <div className={styles.subjectInfo}>
                  <h3>Sosyal Bilimler</h3>
                  <div className={styles.subjectStats}>
                    <span>TYT Sosyal Ort: {exams.filter(e => (e.tyt_sosyal_dogru || 0) > 0).length > 0 ? (exams.filter(e => (e.tyt_sosyal_dogru || 0) > 0).reduce((sum, e) => sum + Math.max(0, (e.tyt_sosyal_dogru || 0) - ((e.tyt_sosyal_yanlis || 0) * 0.25)), 0) / exams.filter(e => (e.tyt_sosyal_dogru || 0) > 0).length).toFixed(1) : '0'}</span>
                  </div>
                </div>
              </div>
              <div className={styles.subjectTips}>
                <h4>💡 Sosyal Bilimler İçin Öneriler</h4>
                <ul>
                  <li>Harita ve grafik okuma becerilerinizi geliştirin</li>
                  <li>Tarihsel olayları kronolojik sırayla öğrenin</li>
                  <li>Güncel olayları takip edin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Genel Grafikler */}
        <div className={styles.chartsGrid}>
          {getSubjectData('tyt_net').some(d => d.value > 0) && 
            renderChart(getSubjectData('tyt_net'), 'TYT Net Gelişimi', '#3b82f6')}
          {getSubjectData('ayt_net').some(d => d.value > 0) && 
            renderChart(getSubjectData('ayt_net'), 'AYT Net Gelişimi', '#10b981')}
          {getSubjectData('matematik').some(d => d.value > 0) && 
            renderChart(getSubjectData('matematik'), 'Matematik Net Gelişimi', '#f59e0b')}
          {getSubjectData('turkce').some(d => d.value > 0) && 
            renderChart(getSubjectData('turkce'), 'Türkçe Net Gelişimi', '#ef4444')}
          {getSubjectData('yerlestirime_puani').some(d => d.value > 0) && 
            renderChart(getSubjectData('yerlestirime_puani'), 'Yerleştirme Puanı Gelişimi', '#8b5cf6')}
        </div>
        
        {/* Karşılaştırma Bölümü */}
        <div className={styles.comparisonSection}>
          <div className={styles.comparisonHeader}>
            <h2>📊 Performans Karşılaştırması</h2>
            <p>Son sınavlarınızı karşılaştırın ve gelişiminizi takip edin</p>
          </div>
          
          {exams.length >= 2 && (
            <div className={styles.comparisonCards}>
              {/* Son İki Sınav Karşılaştırması */}
              <div className={styles.comparisonCard}>
                <h3>🔄 Son İki Sınav Karşılaştırması</h3>
                <div className={styles.comparisonData}>
                  <div className={styles.examComparison}>
                    <div className={styles.examColumn}>
                      <h4>Önceki Sınav</h4>
                      <div className={styles.examDate}>{new Date(exams[1].exam_date).toLocaleDateString('tr-TR')}</div>
                      <div className={styles.examScores}>
                        <div className={styles.scoreItem}>
                          <span>TYT Net:</span>
                          <span>{(exams[1].tytScore?.netScore || 0).toFixed(1)}</span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span>Matematik:</span>
                          <span>{Math.max(0, (exams[1].tyt_matematik_dogru || 0) - ((exams[1].tyt_matematik_yanlis || 0) * 0.25)).toFixed(1)}</span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span>Türkçe:</span>
                          <span>{Math.max(0, (exams[1].tyt_turkce_dogru || 0) - ((exams[1].tyt_turkce_yanlis || 0) * 0.25)).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.comparisonArrow}>→</div>
                    
                    <div className={styles.examColumn}>
                      <h4>Son Sınav</h4>
                      <div className={styles.examDate}>{new Date(exams[0].exam_date).toLocaleDateString('tr-TR')}</div>
                      <div className={styles.examScores}>
                        <div className={styles.scoreItem}>
                          <span>TYT Net:</span>
                          <span>{(exams[0].tytScore?.netScore || 0).toFixed(1)}</span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span>Matematik:</span>
                          <span>{Math.max(0, (exams[0].tyt_matematik_dogru || 0) - ((exams[0].tyt_matematik_yanlis || 0) * 0.25)).toFixed(1)}</span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span>Türkçe:</span>
                          <span>{Math.max(0, (exams[0].tyt_turkce_dogru || 0) - ((exams[0].tyt_turkce_yanlis || 0) * 0.25)).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonResults}>
                    <h4>📈 Değişim Analizi</h4>
                    <div className={styles.changeItems}>
                      {(() => {
                        const prevTYT = exams[1].tytScore?.netScore || 0;
                        const currentTYT = exams[0].tytScore?.netScore || 0;
                        const tytChange = currentTYT - prevTYT;
                        
                        const prevMath = Math.max(0, (exams[1].tyt_matematik_dogru || 0) - ((exams[1].tyt_matematik_yanlis || 0) * 0.25));
                        const currentMath = Math.max(0, (exams[0].tyt_matematik_dogru || 0) - ((exams[0].tyt_matematik_yanlis || 0) * 0.25));
                        const mathChange = currentMath - prevMath;
                        
                        const prevTurkish = Math.max(0, (exams[1].tyt_turkce_dogru || 0) - ((exams[1].tyt_turkce_yanlis || 0) * 0.25));
                        const currentTurkish = Math.max(0, (exams[0].tyt_turkce_dogru || 0) - ((exams[0].tyt_turkce_yanlis || 0) * 0.25));
                        const turkishChange = currentTurkish - prevTurkish;
                        
                        return (
                          <>
                            <div className={`${styles.changeItem} ${tytChange >= 0 ? styles.positive : styles.negative}`}>
                              <span>TYT Net:</span>
                              <span>{tytChange >= 0 ? '+' : ''}{tytChange.toFixed(1)} {tytChange >= 0 ? '📈' : '📉'}</span>
                            </div>
                            <div className={`${styles.changeItem} ${mathChange >= 0 ? styles.positive : styles.negative}`}>
                              <span>Matematik:</span>
                              <span>{mathChange >= 0 ? '+' : ''}{mathChange.toFixed(1)} {mathChange >= 0 ? '📈' : '📉'}</span>
                            </div>
                            <div className={`${styles.changeItem} ${turkishChange >= 0 ? styles.positive : styles.negative}`}>
                              <span>Türkçe:</span>
                              <span>{turkishChange >= 0 ? '+' : ''}{turkishChange.toFixed(1)} {turkishChange >= 0 ? '📈' : '📉'}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hedef Karşılaştırması */}
              <div className={styles.comparisonCard}>
                <h3>🎯 Hedef Karşılaştırması</h3>
                <div className={styles.targetComparison}>
                  <div className={styles.targetItem}>
                    <span className={styles.targetLabel}>Hedef TYT Net:</span>
                    <span className={styles.targetValue}>120</span>
                  </div>
                  <div className={styles.targetItem}>
                    <span className={styles.targetLabel}>Mevcut Ortalama:</span>
                    <span className={styles.targetValue}>{stats.tyt.avg.toFixed(1)}</span>
                  </div>
                  <div className={styles.targetItem}>
                    <span className={styles.targetLabel}>Hedefe Kalan:</span>
                    <span className={`${styles.targetValue} ${120 - stats.tyt.avg > 0 ? styles.negative : styles.positive}`}>
                      {120 - stats.tyt.avg > 0 ? (120 - stats.tyt.avg).toFixed(1) : 'Hedef Aşıldı! 🎉'}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${Math.min(100, (stats.tyt.avg / 120) * 100)}%` }}
                    ></div>
                  </div>
                  <div className={styles.progressText}>
                    Hedefin %{Math.min(100, (stats.tyt.avg / 120) * 100).toFixed(1)}'i tamamlandı
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {exams.length < 2 && (
            <div className={styles.noComparisonData}>
              <div className={styles.noDataIcon}>📊</div>
              <h3>Karşılaştırma için daha fazla sınav verisi gerekli</h3>
              <p>Performans karşılaştırması yapabilmek için en az 2 sınav sonucu girmeniz gerekiyor.</p>
            </div>
          )}
        </div>
        
        {/* Detaylı Analiz */}
        <div className={styles.analysisSection}>
          <div className={styles.analysisCard}>
            <h2>🔍 Detaylı Performans Analizi</h2>
            
            {/* Performans Özeti */}
            <div className={styles.performanceSummary}>
              <div className={styles.performanceItem}>
                <div className={styles.performanceIcon}>📊</div>
                <div className={styles.performanceContent}>
                  <h4>Genel Durum</h4>
                  <p>{exams.length > 0 ? 
                    `${exams.length} sınavda ortalama ${stats?.tyt?.avg > 0 ? stats.tyt.avg.toFixed(1) : '0'} TYT net ile ${stats?.yerlestirime?.avg > 0 ? 'iyi' : 'geliştirilmesi gereken'} bir performans sergiliyorsunuz.` :
                    'Henüz sınav verisi bulunmuyor. İlk sınavınızı ekleyerek analizinizi başlatın.'
                  }</p>
                </div>
              </div>
              
              <div className={styles.performanceItem}>
                <div className={styles.performanceIcon}>📈</div>
                <div className={styles.performanceContent}>
                  <h4>Gelişim Trendi</h4>
                  <p>{stats?.tyt?.trend > 0 ? 
                    `TYT netinizde ${stats.tyt.trend.toFixed(1)} puanlık pozitif bir trend var. Bu harika!` :
                    stats?.tyt?.trend < 0 ?
                    `TYT netinizde ${Math.abs(stats.tyt.trend).toFixed(1)} puanlık düşüş var. Çalışma stratejinizi gözden geçirin.` :
                    'Performansınız stabil seyrediyor.'
                  }</p>
                </div>
              </div>
              
              <div className={styles.performanceItem}>
                <div className={styles.performanceIcon}>🎯</div>
                <div className={styles.performanceContent}>
                  <h4>Hedef Durumu</h4>
                  <p>{stats?.yerlestirime?.avg > 400 ? 
                    'Yerleştirme puanınız hedef aralığında. Devam edin!' :
                    'Yerleştirme puanınızı artırmak için daha fazla çalışma gerekiyor.'
                  }</p>
                </div>
              </div>
            </div>
            
            {/* Güçlü Yönler */}
            <div className={styles.analysisItem}>
              <h3>💪 Güçlü Yönleriniz</h3>
              <div className={styles.strengthsList}>
                {stats.tyt.avg > 80 && (
                  <div className={styles.strengthItem}>
                    <span className={styles.strengthIcon}>✅</span>
                    <span>TYT performansınız oldukça iyi</span>
                  </div>
                )}
                {stats.ayt.avg > 60 && (
                  <div className={styles.strengthItem}>
                    <span className={styles.strengthIcon}>✅</span>
                    <span>AYT performansınız ortalamanın üstünde</span>
                  </div>
                )}
                {stats.tyt.trend > 2 && (
                  <div className={styles.strengthItem}>
                    <span className={styles.strengthIcon}>✅</span>
                    <span>TYT netlerinizde pozitif trend var</span>
                  </div>
                )}
                {stats.ayt.avg > 0 && stats.ayt.trend > 2 && (
                  <div className={styles.strengthItem}>
                    <span className={styles.strengthIcon}>✅</span>
                    <span>AYT netlerinizde pozitif trend var</span>
                  </div>
                )}
                {stats.yerlestirime.avg > 400 && (
                  <div className={styles.strengthItem}>
                    <span className={styles.strengthIcon}>✅</span>
                    <span>Yerleştirme puanınız iyi seviyede</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gelişim Alanları */}
            <div className={styles.analysisItem}>
              <h3>🎯 Gelişim Alanları ve Öneriler</h3>
              <div className={styles.improvementsList}>
                {stats.tyt.avg < 60 && stats.tyt.avg > 0 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>TYT netlerinizi artırmaya odaklanın</span>
                      <div className={styles.improvementTips}>
                        <small>💡 Günlük 20 soru çözmeyi hedefleyin</small>
                      </div>
                    </div>
                  </div>
                )}
                {stats.ayt.avg < 40 && stats.ayt.avg > 0 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>AYT derslerine daha fazla zaman ayırın</span>
                      <div className={styles.improvementTips}>
                        <small>💡 Konu tekrarlarını artırın</small>
                      </div>
                    </div>
                  </div>
                )}
                {stats.ayt.avg === 0 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>AYT sınavlarına da girmeyi düşünebilirsiniz</span>
                    </div>
                  </div>
                )}
                {stats.tyt.trend < -2 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>TYT performansınızda düşüş var, tekrar planınızı gözden geçirin</span>
                    </div>
                  </div>
                )}
                {stats.ayt.avg > 0 && stats.ayt.trend < -2 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>AYT performansınızda düşüş var, çalışma stratejinizi değiştirin</span>
                    </div>
                  </div>
                )}
                {stats.yerlestirime.avg < 300 && stats.yerlestirime.avg > 0 && (
                  <div className={styles.improvementItem}>
                    <span className={styles.improvementIcon}>📈</span>
                    <div className={styles.improvementContent}>
                      <span className={styles.improvementText}>Yerleştirme puanınızı artırmak için hem TYT hem AYT'ye odaklanın</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Çalışma Önerileri */}
            <div className={styles.analysisItem}>
              <h3>📚 Kişiselleştirilmiş Çalışma Önerileri</h3>
              <div className={styles.studyTips}>
                <div className={styles.tipCard}>
                  <div className={styles.tipIcon}>⏰</div>
                  <div className={styles.tipContent}>
                    <h4>Zaman Yönetimi</h4>
                    <p>Günlük 4-5 saat odaklanmış çalışma ile hedeflerinize ulaşabilirsiniz.</p>
                  </div>
                </div>
                
                <div className={styles.tipCard}>
                  <div className={styles.tipIcon}>📊</div>
                  <div className={styles.tipContent}>
                    <h4>Düzenli Ölçme</h4>
                    <p>Haftada 2-3 deneme sınavı çözerek gelişiminizi takip edin.</p>
                  </div>
                </div>
                
                <div className={styles.tipCard}>
                  <div className={styles.tipIcon}>🎯</div>
                  <div className={styles.tipContent}>
                    <h4>Hedef Odaklı Çalışma</h4>
                    <p>Zayıf olduğunuz konulara %60, güçlü olduğunuz konulara %40 zaman ayırın.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
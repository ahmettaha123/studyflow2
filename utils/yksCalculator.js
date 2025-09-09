// YKS Puan Hesaplama Fonksiyonları

// TYT Puan Hesaplama
export function calculateTYTScore(answers) {
  const {
    turkce_dogru = 0, turkce_yanlis = 0,
    matematik_dogru = 0, matematik_yanlis = 0,
    fen_dogru = 0, fen_yanlis = 0,
    sosyal_dogru = 0, sosyal_yanlis = 0
  } = answers;

  // Net hesaplama (doğru - yanlış/4)
  const turkce_net = Math.max(0, turkce_dogru - (turkce_yanlis / 4));
  const matematik_net = Math.max(0, matematik_dogru - (matematik_yanlis / 4));
  const fen_net = Math.max(0, fen_dogru - (fen_yanlis / 4));
  const sosyal_net = Math.max(0, sosyal_dogru - (sosyal_yanlis / 4));

  // Toplam net
  const toplam_net = turkce_net + matematik_net + fen_net + sosyal_net;

  // TYT Ham Puan (Yaklaşık formül)
  const tyt_ham_puan = Math.max(100, (toplam_net * 4) + 100);

  return {
    turkce_net,
    matematik_net,
    fen_net,
    sosyal_net,
    toplam_net,
    netScore: toplam_net, // Added this for compatibility
    tyt_ham_puan,
    subjects: {
      turkce: turkce_net,
      matematik: matematik_net,
      fen: fen_net,
      sosyal: sosyal_net
    }
  };
}

// AYT Puan Hesaplama
export function calculateAYTScore(answers, examType = 'sayisal') {
  const {
    matematik_dogru = 0, matematik_yanlis = 0,
    fizik_dogru = 0, fizik_yanlis = 0,
    kimya_dogru = 0, kimya_yanlis = 0,
    biyoloji_dogru = 0, biyoloji_yanlis = 0,
    edebiyat_dogru = 0, edebiyat_yanlis = 0,
    tarih1_dogru = 0, tarih1_yanlis = 0,
    cografya1_dogru = 0, cografya1_yanlis = 0,
    tarih2_dogru = 0, tarih2_yanlis = 0,
    cografya2_dogru = 0, cografya2_yanlis = 0,
    felsefe_dogru = 0, felsefe_yanlis = 0,
    din_dogru = 0, din_yanlis = 0
  } = answers;

  let nets = {};
  let ham_puan = 100;

  if (examType === 'sayisal') {
    // Sayısal AYT
    nets.matematik_net = Math.max(0, matematik_dogru - (matematik_yanlis / 4));
    nets.fizik_net = Math.max(0, fizik_dogru - (fizik_yanlis / 4));
    nets.kimya_net = Math.max(0, kimya_dogru - (kimya_yanlis / 4));
    nets.biyoloji_net = Math.max(0, biyoloji_dogru - (biyoloji_yanlis / 4));
    
    const toplam_net = nets.matematik_net + nets.fizik_net + nets.kimya_net + nets.biyoloji_net;
    ham_puan = (toplam_net * 4) + 100;
    
    return {
      ...nets,
      toplam_net: Math.max(0, toplam_net),
      netScore: Math.max(0, toplam_net), // Added for compatibility
      ayt_ham_puan: Math.max(100, ham_puan),
      subjects: nets
    };
  } else if (examType === 'esit_agirlik') {
    // Eşit Ağırlık AYT
    nets.matematik_net = Math.max(0, matematik_dogru - (matematik_yanlis / 4));
    nets.edebiyat_net = Math.max(0, edebiyat_dogru - (edebiyat_yanlis / 4));
    nets.tarih1_net = Math.max(0, tarih1_dogru - (tarih1_yanlis / 4));
    nets.cografya1_net = Math.max(0, cografya1_dogru - (cografya1_yanlis / 4));
    
    const toplam_net = nets.matematik_net + nets.edebiyat_net + nets.tarih1_net + nets.cografya1_net;
    ham_puan = (toplam_net * 4) + 100;
    
    return {
      ...nets,
      toplam_net: Math.max(0, toplam_net),
      netScore: Math.max(0, toplam_net), // Added for compatibility
      ayt_ham_puan: Math.max(100, ham_puan),
      subjects: nets
    };
  } else if (examType === 'sozel') {
    // Sözel AYT
    nets.edebiyat_net = Math.max(0, edebiyat_dogru - (edebiyat_yanlis / 4));
    nets.tarih1_net = Math.max(0, tarih1_dogru - (tarih1_yanlis / 4));
    nets.cografya1_net = Math.max(0, cografya1_dogru - (cografya1_yanlis / 4));
    nets.tarih2_net = Math.max(0, tarih2_dogru - (tarih2_yanlis / 4));
    nets.cografya2_net = Math.max(0, cografya2_dogru - (cografya2_yanlis / 4));
    nets.felsefe_net = Math.max(0, felsefe_dogru - (felsefe_yanlis / 4));
    nets.din_net = Math.max(0, din_dogru - (din_yanlis / 4));
    
    const toplam_net = nets.edebiyat_net + nets.tarih1_net + nets.cografya1_net + 
                      nets.tarih2_net + nets.cografya2_net + nets.felsefe_net + nets.din_net;
    ham_puan = (toplam_net * 4) + 100;
    
    return {
      ...nets,
      toplam_net: Math.max(0, toplam_net),
      netScore: Math.max(0, toplam_net), // Added for compatibility
      ayt_ham_puan: Math.max(100, ham_puan),
      subjects: nets
    };
  }
}

// OBP (Ortaöğretim Başarı Puanı) Hesaplama
export function calculateOBP(diplomaNotu, liseType = 'anadolu') {
  // Lise türüne göre katsayılar
  const katsayilar = {
    'anadolu': 0.12,
    'meslek': 0.18,
    'imam_hatip': 0.12,
    'guzel_sanatlar': 0.12,
    'spor': 0.12
  };
  
  const katsayi = katsayilar[liseType] || 0.12;
  const obp = diplomaNotu * 5 * katsayi; // Düzeltildi: diplomaNotu * 5 * katsayı
  
  return Math.min(100, Math.max(0, obp)); // OBP maksimum 100 puan
}

// Yerleştirme Puanı Hesaplama
export function calculateYerlestirmePuani(tytScore, aytScore, obp, examType = 'sayisal') {
  // Alan katsayıları
  const katsayilar = {
    'sayisal': { tyt: 0.4, ayt: 0.6 },
    'esit_agirlik': { tyt: 0.4, ayt: 0.6 },
    'sozel': { tyt: 0.4, ayt: 0.6 },
    'dil': { tyt: 0.5, ayt: 0.5 }
  };
  
  const katsayi = katsayilar[examType] || katsayilar.sayisal;
  
  const yerlestirme_puani = (tytScore * katsayi.tyt) + (aytScore * katsayi.ayt) + obp;
  
  return Math.max(100, yerlestirme_puani);
}

// Tam YKS Puan Hesaplama
export function calculateFullYKSScore(tytAnswers, aytAnswers, obpData, examType = 'sayisal') {
  // TYT hesapla (sadece AYT değilse)
  const tytResult = examType.startsWith('ayt_') ? 
    { turkce_net: 0, matematik_net: 0, fen_net: 0, sosyal_net: 0, toplam_net: 0, tyt_ham_puan: 100 } :
    calculateTYTScore(tytAnswers);
  
  // AYT hesapla (sadece TYT değilse)
  const aytResult = examType === 'tyt_only' ? 
    { matematik_net: 0, fizik_net: 0, kimya_net: 0, biyoloji_net: 0, toplam_net: 0, ayt_ham_puan: 100 } :
    calculateAYTScore(aytAnswers, examType.startsWith('ayt_') ? examType.replace('ayt_', '') : examType);
  
  // OBP hesapla
  const obp = calculateOBP(obpData.diplomaNotu, obpData.liseType);
  
  // Yerleştirme puanı hesapla
  const yerlestirmePuani = calculateYerlestirmePuani(
    tytResult.tyt_ham_puan,
    aytResult.ayt_ham_puan,
    obp,
    examType
  );
  
  return {
    tyt: tytResult,
    ayt: aytResult,
    obp: obp,
    yerlestirme_puani: yerlestirmePuani,
    exam_type: examType
  };
}

// Hedef puana ulaşmak için gereken net hesaplama
export function calculateRequiredNets(targetScore, currentTYT, obp, examType = 'sayisal') {
  const katsayilar = {
    'sayisal': { tyt: 0.4, ayt: 0.6 },
    'esit_agirlik': { tyt: 0.4, ayt: 0.6 },
    'sozel': { tyt: 0.4, ayt: 0.6 },
    'dil': { tyt: 0.5, ayt: 0.5 }
  };
  
  const katsayi = katsayilar[examType] || katsayilar.sayisal;
  
  // Hedef AYT puanını hesapla
  const requiredAYTScore = (targetScore - (currentTYT * katsayi.tyt) - obp) / katsayi.ayt;
  
  // Gereken net sayısını hesapla (yaklaşık)
  const requiredNets = Math.max(0, (requiredAYTScore - 100) / 4);
  
  return {
    required_ayt_score: Math.max(100, requiredAYTScore),
    required_nets: Math.max(0, requiredNets),
    is_achievable: requiredAYTScore <= 500 && requiredNets <= 80
  };
}

// Performans analizi
export function analyzePerformance(examResults) {
  if (!examResults || examResults.length === 0) {
    return null;
  }
  
  const latest = examResults[0];
  const previous = examResults[1];
  
  let analysis = {
    trend: 'stable',
    improvement_areas: [],
    strong_areas: [],
    recommendations: []
  };
  
  if (previous) {
    const scoreDiff = latest.yerlestirme_puani - previous.yerlestirme_puani;
    
    if (scoreDiff > 10) {
      analysis.trend = 'improving';
    } else if (scoreDiff < -10) {
      analysis.trend = 'declining';
    }
  }
  
  // TYT analizi
  if (latest.tyt) {
    const nets = latest.tyt;
    const subjects = ['turkce_net', 'matematik_net', 'fen_net', 'sosyal_net'];
    const subjectNames = ['Türkçe', 'Matematik', 'Fen', 'Sosyal'];
    
    subjects.forEach((subject, index) => {
      const net = nets[subject] || 0;
      const maxNet = subject === 'turkce_net' ? 40 : subject === 'matematik_net' ? 40 : subject === 'fen_net' ? 20 : 20;
      const percentage = (net / maxNet) * 100;
      
      if (percentage < 40) {
        analysis.improvement_areas.push(subjectNames[index]);
      } else if (percentage > 70) {
        analysis.strong_areas.push(subjectNames[index]);
      }
    });
  }
  
  // Öneriler oluştur
  if (analysis.improvement_areas.length > 0) {
    analysis.recommendations.push(`${analysis.improvement_areas.join(', ')} derslerine daha fazla odaklanın.`);
  }
  
  if (analysis.strong_areas.length > 0) {
    analysis.recommendations.push(`${analysis.strong_areas.join(', ')} derslerindeki başarınızı koruyun.`);
  }
  
  return analysis;
}
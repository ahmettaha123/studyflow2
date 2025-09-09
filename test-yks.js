// YKS Hesaplama Test Dosyası
const { calculateFullYKSScore, calculateTYTScore, calculateAYTScore, calculateOBP, calculateYerlestirmePuani } = require('./utils/yksCalculator');

// Test verileri
const testTYTAnswers = {
  turkce_dogru: 30,
  turkce_yanlis: 5,
  matematik_dogru: 25,
  matematik_yanlis: 10,
  fen_dogru: 15,
  fen_yanlis: 3,
  sosyal_dogru: 18,
  sosyal_yanlis: 2
};

const testAYTAnswers = {
  matematik_dogru: 30,
  matematik_yanlis: 5,
  fizik_dogru: 12,
  fizik_yanlis: 2,
  kimya_dogru: 10,
  kimya_yanlis: 3,
  biyoloji_dogru: 8,
  biyoloji_yanlis: 5,
  edebiyat_dogru: 0,
  edebiyat_yanlis: 0,
  tarih1_dogru: 0,
  tarih1_yanlis: 0,
  cografya1_dogru: 0,
  cografya1_yanlis: 0,
  tarih2_dogru: 0,
  tarih2_yanlis: 0,
  cografya2_dogru: 0,
  cografya2_yanlis: 0,
  felsefe_dogru: 0,
  felsefe_yanlis: 0,
  din_dogru: 0,
  din_yanlis: 0
};

const testOBPData = {
  diplomaNotu: 85,
  liseType: 'anadolu'
};

console.log('=== YKS Hesaplama Testi ===');

// TYT Testi
console.log('\n1. TYT Hesaplama:');
const tytResult = calculateTYTScore(testTYTAnswers);
console.log('TYT Sonuçları:', tytResult);

// AYT Testi
console.log('\n2. AYT Hesaplama (Sayısal):');
const aytResult = calculateAYTScore(testAYTAnswers, 'sayisal');
console.log('AYT Sonuçları:', aytResult);

// OBP Testi
console.log('\n3. OBP Hesaplama:');
const obpResult = calculateOBP(testOBPData.diplomaNotu, testOBPData.liseType);
console.log('OBP Sonucu:', obpResult);

// Yerleştirme Puanı Testi
console.log('\n4. Yerleştirme Puanı Hesaplama:');
const yerlestirmePuani = calculateYerlestirmePuani(
  tytResult.tyt_ham_puan,
  aytResult.ayt_ham_puan,
  obpResult,
  'sayisal'
);
console.log('Yerleştirme Puanı:', yerlestirmePuani);

// Tam YKS Hesaplama Testi
console.log('\n5. Tam YKS Hesaplama:');
const fullResult = calculateFullYKSScore(testTYTAnswers, testAYTAnswers, testOBPData, 'sayisal');
console.log('Tam YKS Sonuçları:', JSON.stringify(fullResult, null, 2));

console.log('\n=== Test Tamamlandı ===');
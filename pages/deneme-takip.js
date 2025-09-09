import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { gsap } from 'gsap';
import { calculateFullYKSScore } from '../utils/yksCalculator';
import { supabase } from '../lib/supabase';
import styles from '../styles/DenemeTakip.module.css';

export default function DenemeTakip() {
  const [user, setUser] = useState(null);
  const [examType, setExamType] = useState('sayisal');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [obpData, setObpData] = useState({ diplomaNotu: 85, liseType: 'anadolu' });
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [editingResult, setEditingResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // GSAP refs
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const scoreRef = useRef(null);
  const historyRef = useRef(null);
  
  // TYT Cevapları
  const [tytAnswers, setTytAnswers] = useState({
    turkce_dogru: 0, turkce_yanlis: 0,
    matematik_dogru: 0, matematik_yanlis: 0,
    fen_dogru: 0, fen_yanlis: 0,
    sosyal_dogru: 0, sosyal_yanlis: 0
  });
  
  // AYT Cevapları
  const [aytAnswers, setAytAnswers] = useState({
    matematik_dogru: 0, matematik_yanlis: 0,
    fizik_dogru: 0, fizik_yanlis: 0,
    kimya_dogru: 0, kimya_yanlis: 0,
    biyoloji_dogru: 0, biyoloji_yanlis: 0,
    edebiyat_dogru: 0, edebiyat_yanlis: 0,
    tarih1_dogru: 0, tarih1_yanlis: 0,
    cografya1_dogru: 0, cografya1_yanlis: 0,
    tarih2_dogru: 0, tarih2_yanlis: 0,
    cografya2_dogru: 0, cografya2_yanlis: 0,
    felsefe_dogru: 0, felsefe_yanlis: 0,
    din_dogru: 0, din_yanlis: 0
  });

  useEffect(() => {
    // Kullanıcı durumunu kontrol et
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadExamResults(session.user.id);
      }
    };
    
    checkUser();
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadExamResults(session.user.id);
      }
    });
    
    // GSAP animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(formRef.current,
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(scoreRef.current,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );
    
    if (historyRef.current) {
      tl.fromTo(historyRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Animate result cards when results change
  useEffect(() => {
    if (results.length > 0) {
      const cards = document.querySelectorAll(`.${styles.resultCard}`);
      gsap.fromTo(cards,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1
        }
      );
    }
  }, [results]);
  
  const loadExamResults = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', userId)
        .order('exam_date', { ascending: false });
      
      if (!error && data) {
        setResults(data);
      }
    } catch (err) {
      console.error('Error loading exam results:', err);
    }
  };

  // Düzenleme fonksiyonları
  const handleEditResult = (result) => {
    setEditingResult(result);
    setExamName(result.exam_name);
    setExamDate(result.exam_date);
    setExamType(result.exam_type);
    
    // TYT cevaplarını yükle
    setTytAnswers({
      turkce_dogru: result.tyt_turkce_dogru || 0,
      turkce_yanlis: result.tyt_turkce_yanlis || 0,
      matematik_dogru: result.tyt_matematik_dogru || 0,
      matematik_yanlis: result.tyt_matematik_yanlis || 0,
      fen_dogru: result.tyt_fen_dogru || 0,
      fen_yanlis: result.tyt_fen_yanlis || 0,
      sosyal_dogru: result.tyt_sosyal_dogru || 0,
      sosyal_yanlis: result.tyt_sosyal_yanlis || 0
    });
    
    // AYT cevaplarını yükle
    setAytAnswers({
      matematik_dogru: result.ayt_matematik_dogru || 0,
      matematik_yanlis: result.ayt_matematik_yanlis || 0,
      fizik_dogru: result.ayt_fizik_dogru || 0,
      fizik_yanlis: result.ayt_fizik_yanlis || 0,
      kimya_dogru: result.ayt_kimya_dogru || 0,
      kimya_yanlis: result.ayt_kimya_yanlis || 0,
      biyoloji_dogru: result.ayt_biyoloji_dogru || 0,
      biyoloji_yanlis: result.ayt_biyoloji_yanlis || 0,
      edebiyat_dogru: result.ayt_edebiyat_dogru || 0,
      edebiyat_yanlis: result.ayt_edebiyat_yanlis || 0,
      tarih1_dogru: result.ayt_tarih1_dogru || 0,
      tarih1_yanlis: result.ayt_tarih1_yanlis || 0,
      cografya1_dogru: result.ayt_cografya1_dogru || 0,
      cografya1_yanlis: result.ayt_cografya1_yanlis || 0,
      tarih2_dogru: result.ayt_tarih2_dogru || 0,
      tarih2_yanlis: result.ayt_tarih2_yanlis || 0,
      cografya2_dogru: result.ayt_cografya2_dogru || 0,
      cografya2_yanlis: result.ayt_cografya2_yanlis || 0,
      felsefe_dogru: result.ayt_felsefe_dogru || 0,
      felsefe_yanlis: result.ayt_felsefe_yanlis || 0,
      din_dogru: result.ayt_din_dogru || 0,
      din_yanlis: result.ayt_din_yanlis || 0
    });
    
    // OBP bilgilerini yükle
    setObpData({
      diplomaNotu: result.diploma_notu || 85,
      liseType: result.lise_type || 'anadolu'
    });
    
    setShowEditModal(true);
    
    // Animate modal entrance
    setTimeout(() => {
      const modal = document.querySelector(`.${styles.modal}`);
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      if (modal && modalContent) {
        gsap.fromTo(modal, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(modalContent,
          { scale: 0.8, y: 50 },
          { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
      }
    }, 10);
  };

  const handleViewDetail = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
    
    // Animate modal entrance
    setTimeout(() => {
      const modal = document.querySelector(`.${styles.modal}`);
      const modalContent = document.querySelector(`.${styles.modalContent}`);
      if (modal && modalContent) {
        gsap.fromTo(modal, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(modalContent,
          { scale: 0.8, y: 50 },
          { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
      }
    }, 10);
  };

  const handleDeleteResult = async (resultId) => {
    if (!confirm('Bu deneme sonucunu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('exam_results')
        .delete()
        .eq('id', resultId);
      if (error) {
        setError('Sonuç silinirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Deneme sonucu başarıyla silindi!');
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          await loadExamResults(user.id);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu.');
    }
  };

  const handleUpdateResult = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setError('Oturum açmanız gerekiyor');
      setSaving(false);
      return;
    }
    
    const scoreData = calculateScore();
    
    const examData = {
      exam_name: examName,
      exam_date: examDate,
      exam_type: examType,
      
      // TYT Cevapları
      tyt_turkce_dogru: tytAnswers.turkce_dogru,
      tyt_turkce_yanlis: tytAnswers.turkce_yanlis,
      tyt_matematik_dogru: tytAnswers.matematik_dogru,
      tyt_matematik_yanlis: tytAnswers.matematik_yanlis,
      tyt_fen_dogru: tytAnswers.fen_dogru,
      tyt_fen_yanlis: tytAnswers.fen_yanlis,
      tyt_sosyal_dogru: tytAnswers.sosyal_dogru,
      tyt_sosyal_yanlis: tytAnswers.sosyal_yanlis,
      
      // AYT Cevapları
      ayt_matematik_dogru: aytAnswers.matematik_dogru,
      ayt_matematik_yanlis: aytAnswers.matematik_yanlis,
      ayt_fizik_dogru: aytAnswers.fizik_dogru,
      ayt_fizik_yanlis: aytAnswers.fizik_yanlis,
      ayt_kimya_dogru: aytAnswers.kimya_dogru,
      ayt_kimya_yanlis: aytAnswers.kimya_yanlis,
      ayt_biyoloji_dogru: aytAnswers.biyoloji_dogru,
      ayt_biyoloji_yanlis: aytAnswers.biyoloji_yanlis,
      ayt_edebiyat_dogru: aytAnswers.edebiyat_dogru,
      ayt_edebiyat_yanlis: aytAnswers.edebiyat_yanlis,
      ayt_tarih1_dogru: aytAnswers.tarih1_dogru,
      ayt_tarih1_yanlis: aytAnswers.tarih1_yanlis,
      ayt_cografya1_dogru: aytAnswers.cografya1_dogru,
      ayt_cografya1_yanlis: aytAnswers.cografya1_yanlis,
      ayt_tarih2_dogru: aytAnswers.tarih2_dogru,
      ayt_tarih2_yanlis: aytAnswers.tarih2_yanlis,
      ayt_cografya2_dogru: aytAnswers.cografya2_dogru,
      ayt_cografya2_yanlis: aytAnswers.cografya2_yanlis,
      ayt_felsefe_dogru: aytAnswers.felsefe_dogru,
      ayt_felsefe_yanlis: aytAnswers.felsefe_yanlis,
      ayt_din_dogru: aytAnswers.din_dogru,
      ayt_din_yanlis: aytAnswers.din_yanlis,
      
      // OBP Bilgileri
      diploma_notu: obpData.diplomaNotu,
      lise_type: obpData.liseType,
      
      // Hesaplanan puanlar
      tyt_net: scoreData.tyt.toplam_net,
      ayt_net: scoreData.ayt.toplam_net,
      tyt_puan: scoreData.tyt.tyt_ham_puan,
      ayt_puan: scoreData.ayt.ayt_ham_puan,
      obp: scoreData.obp,
      obp_puan: scoreData.obp,
      yerlestirme_puani: scoreData.yerlestirme_puani,
      
      // YDT alanları
      ydt_dogru: 0,
      ydt_yanlis: 0,
      dil_puani: 0
    };
    
    try {
      const { error } = await supabase
        .from('exam_results')
        .update(examData)
        .eq('id', editingResult.id);
      
      if (error) {
        setError('Sonuç güncellenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Deneme sonucu başarıyla güncellendi!');
        await loadExamResults(user.id);
        setShowEditModal(false);
        setEditingResult(null);
        
        // Formu temizle
        setExamName('');
        setExamDate('');
        setTytAnswers({
          turkce_dogru: 0, turkce_yanlis: 0,
          matematik_dogru: 0, matematik_yanlis: 0,
          fen_dogru: 0, fen_yanlis: 0,
          sosyal_dogru: 0, sosyal_yanlis: 0
        });
        setAytAnswers({
          matematik_dogru: 0, matematik_yanlis: 0,
          fizik_dogru: 0, fizik_yanlis: 0,
          kimya_dogru: 0, kimya_yanlis: 0,
          biyoloji_dogru: 0, biyoloji_yanlis: 0,
          edebiyat_dogru: 0, edebiyat_yanlis: 0,
          tarih1_dogru: 0, tarih1_yanlis: 0,
          cografya1_dogru: 0, cografya1_yanlis: 0,
          tarih2_dogru: 0, tarih2_yanlis: 0,
          cografya2_dogru: 0, cografya2_yanlis: 0,
          felsefe_dogru: 0, felsefe_yanlis: 0,
          din_dogru: 0, din_yanlis: 0
        });
        setValidationErrors({});
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingResult(null);
    
    // Formu temizle
    setExamName('');
    setExamDate('');
    setTytAnswers({
      turkce_dogru: 0, turkce_yanlis: 0,
      matematik_dogru: 0, matematik_yanlis: 0,
      fen_dogru: 0, fen_yanlis: 0,
      sosyal_dogru: 0, sosyal_yanlis: 0
    });
    setAytAnswers({
      matematik_dogru: 0, matematik_yanlis: 0,
      fizik_dogru: 0, fizik_yanlis: 0,
      kimya_dogru: 0, kimya_yanlis: 0,
      biyoloji_dogru: 0, biyoloji_yanlis: 0,
      edebiyat_dogru: 0, edebiyat_yanlis: 0,
      tarih1_dogru: 0, tarih1_yanlis: 0,
      cografya1_dogru: 0, cografya1_yanlis: 0,
      tarih2_dogru: 0, tarih2_yanlis: 0,
      cografya2_dogru: 0, cografya2_yanlis: 0,
      felsefe_dogru: 0, felsefe_yanlis: 0,
      din_dogru: 0, din_yanlis: 0
    });
    setValidationErrors({});
  };
  
  const handleTytChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    
    // Get subject and type from field
    const subject = field.replace('_dogru', '').replace('_yanlis', '');
    const isCorrect = field.includes('_dogru');
    
    // Get maximum questions for subject
    let maxQuestions = 20; // Default (fen, sosyal)
    if (subject === 'turkce' || subject === 'matematik') {
      maxQuestions = 40;
    }
    
    // Get current values for this subject
    const currentCorrect = isCorrect ? 0 : (tytAnswers[`${subject}_dogru`] || 0);
    const currentIncorrect = isCorrect ? (tytAnswers[`${subject}_yanlis`] || 0) : 0;
    
    // Calculate the new total
    const newCorrect = isCorrect ? numValue : currentCorrect;
    const newIncorrect = isCorrect ? currentIncorrect : numValue;
    const newTotal = newCorrect + newIncorrect;
    
    // Check if total exceeds maximum
    if (newTotal > maxQuestions) {
      // If it exceeds, adjust the value to not exceed the limit
      const adjustedValue = maxQuestions - (isCorrect ? newIncorrect : newCorrect);
      const validValue = Math.max(0, adjustedValue);
      setTytAnswers(prev => ({ ...prev, [field]: validValue }));
    } else {
      // If within limits, use the value
      const validValue = Math.max(0, Math.min(numValue, maxQuestions));
      setTytAnswers(prev => ({ ...prev, [field]: validValue }));
    }
  };
  
  const handleAytChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    
    // Get subject and type from field
    const subject = field.replace('_dogru', '').replace('_yanlis', '');
    const isCorrect = field.includes('_dogru');
    
    // Get maximum questions for subject
    let maxQuestions = 13; // Default (kimya, biyoloji)
    if (subject === 'matematik') {
      maxQuestions = 40;
    } else if (subject === 'fizik') {
      maxQuestions = 14;
    } else if (subject === 'edebiyat') {
      maxQuestions = 24;
    } else if (subject === 'tarih1') {
      maxQuestions = 10;
    } else if (subject === 'cografya1') {
      maxQuestions = 6;
    } else if (subject === 'tarih2') {
      maxQuestions = 11;
    } else if (subject === 'cografya2') {
      maxQuestions = 11;
    } else if (subject === 'felsefe') {
      maxQuestions = 12;
    } else if (subject === 'din') {
      maxQuestions = 6;
    }
    
    // Get current values for this subject
    const currentCorrect = isCorrect ? 0 : (aytAnswers[`${subject}_dogru`] || 0);
    const currentIncorrect = isCorrect ? (aytAnswers[`${subject}_yanlis`] || 0) : 0;
    
    // Calculate the new total
    const newCorrect = isCorrect ? numValue : currentCorrect;
    const newIncorrect = isCorrect ? currentIncorrect : numValue;
    const newTotal = newCorrect + newIncorrect;
    
    // Check if total exceeds maximum
    if (newTotal > maxQuestions) {
      // If it exceeds, adjust the value to not exceed the limit
      const adjustedValue = maxQuestions - (isCorrect ? newIncorrect : newCorrect);
      const validValue = Math.max(0, adjustedValue);
      setAytAnswers(prev => ({ ...prev, [field]: validValue }));
    } else {
      // If within limits, use the value
      const validValue = Math.max(0, Math.min(numValue, maxQuestions));
      setAytAnswers(prev => ({ ...prev, [field]: validValue }));
    }
  };
  
  const calculateScore = () => {
    return calculateFullYKSScore(tytAnswers, aytAnswers, obpData, examType);
  };
  
  // Form validasyonu
  const validateForm = () => {
    const errors = {};
    
    if (!examName.trim()) {
      errors.examName = 'Deneme adı gereklidir';
    } else if (examName.length < 3) {
      errors.examName = 'Deneme adı en az 3 karakter olmalıdır';
    }
    
    if (!examDate) {
      errors.examDate = 'Deneme tarihi gereklidir';
    } else {
      const selectedDate = new Date(examDate);
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
      if (selectedDate < oneYearAgo || selectedDate > oneYearLater) {
        errors.examDate = 'Tarih son 1 yıl içinde olmalıdır';
      }
    }
    
    // TYT ve AYT cevaplarının toplamını kontrol et
    const tytTotal = Object.values(tytAnswers).reduce((sum, val) => sum + val, 0);
    const aytTotal = Object.values(aytAnswers).reduce((sum, val) => sum + val, 0);
    
    if (tytTotal === 0 && aytTotal === 0) {
      errors.answers = 'En az bir soru cevaplanmalıdır';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const saveExamResult = async () => {
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('Lütfen önce giriş yapın.');
      return;
    }
    
    if (!validateForm()) {
      setError('Lütfen form hatalarını düzeltin.');
      return;
    }
    
    setSaving(true);
    
    const scoreData = calculateScore();
    
    const examData = {
      user_id: user.id,
      exam_name: examName,
      exam_date: examDate,
      exam_type: examType,
      
      // TYT Sonuçları
      tyt_turkce_dogru: tytAnswers.turkce_dogru,
      tyt_turkce_yanlis: tytAnswers.turkce_yanlis,
      tyt_matematik_dogru: tytAnswers.matematik_dogru,
      tyt_matematik_yanlis: tytAnswers.matematik_yanlis,
      tyt_fen_dogru: tytAnswers.fen_dogru,
      tyt_fen_yanlis: tytAnswers.fen_yanlis,
      tyt_sosyal_dogru: tytAnswers.sosyal_dogru,
      tyt_sosyal_yanlis: tytAnswers.sosyal_yanlis,
      
      // AYT Sonuçları
      ayt_matematik_dogru: aytAnswers.matematik_dogru,
      ayt_matematik_yanlis: aytAnswers.matematik_yanlis,
      ayt_fizik_dogru: aytAnswers.fizik_dogru,
      ayt_fizik_yanlis: aytAnswers.fizik_yanlis,
      ayt_kimya_dogru: aytAnswers.kimya_dogru,
      ayt_kimya_yanlis: aytAnswers.kimya_yanlis,
      ayt_biyoloji_dogru: aytAnswers.biyoloji_dogru,
      ayt_biyoloji_yanlis: aytAnswers.biyoloji_yanlis,
      ayt_edebiyat_dogru: aytAnswers.edebiyat_dogru,
      ayt_edebiyat_yanlis: aytAnswers.edebiyat_yanlis,
      ayt_tarih1_dogru: aytAnswers.tarih1_dogru,
      ayt_tarih1_yanlis: aytAnswers.tarih1_yanlis,
      ayt_cografya1_dogru: aytAnswers.cografya1_dogru,
      ayt_cografya1_yanlis: aytAnswers.cografya1_yanlis,
      ayt_tarih2_dogru: aytAnswers.tarih2_dogru,
      ayt_tarih2_yanlis: aytAnswers.tarih2_yanlis,
      ayt_cografya2_dogru: aytAnswers.cografya2_dogru,
      ayt_cografya2_yanlis: aytAnswers.cografya2_yanlis,
      ayt_felsefe_dogru: aytAnswers.felsefe_dogru,
      ayt_felsefe_yanlis: aytAnswers.felsefe_yanlis,
      ayt_din_dogru: aytAnswers.din_dogru,
      ayt_din_yanlis: aytAnswers.din_yanlis,
      
      // OBP Bilgileri
      diploma_notu: obpData.diplomaNotu,
      lise_type: obpData.liseType,
      
      // Hesaplanan puanlar
      tyt_net: scoreData.tyt.toplam_net,
      ayt_net: scoreData.ayt.toplam_net,
      tyt_puan: scoreData.tyt.tyt_ham_puan,
      ayt_puan: scoreData.ayt.ayt_ham_puan,
      obp: scoreData.obp,
      obp_puan: scoreData.obp,
      yerlestirme_puani: scoreData.yerlestirme_puani,
      
      // YDT alanları (varsayılan değerler)
      ydt_dogru: 0,
      ydt_yanlis: 0,
      dil_puani: 0
    };
    
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .insert([examData]);
      
      if (error) {
        console.error('Database error:', error);
        setError(`Sonuç kaydedilirken hata oluştu: ${error.message}`);
      } else {
        setSuccess('Deneme sonucu başarıyla kaydedildi!');
        await loadExamResults(user.id);
        
        // Formu temizle
        setExamName('');
        setExamDate('');
        setTytAnswers({
          turkce_dogru: 0, turkce_yanlis: 0,
          matematik_dogru: 0, matematik_yanlis: 0,
          fen_dogru: 0, fen_yanlis: 0,
          sosyal_dogru: 0, sosyal_yanlis: 0
        });
        setAytAnswers({
          matematik_dogru: 0, matematik_yanlis: 0,
          fizik_dogru: 0, fizik_yanlis: 0,
          kimya_dogru: 0, kimya_yanlis: 0,
          biyoloji_dogru: 0, biyoloji_yanlis: 0,
          edebiyat_dogru: 0, edebiyat_yanlis: 0,
          tarih1_dogru: 0, tarih1_yanlis: 0,
          cografya1_dogru: 0, cografya1_yanlis: 0,
          tarih2_dogru: 0, tarih2_yanlis: 0,
          cografya2_dogru: 0, cografya2_yanlis: 0,
          felsefe_dogru: 0, felsefe_yanlis: 0,
          din_dogru: 0, din_yanlis: 0
        });
        setValidationErrors({});
        
        // Başarı mesajını 3 saniye sonra temizle
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };
  
  const currentScore = calculateScore();
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Deneme Takip - StudyFlow</title>
        <meta name="description" content="Deneme sınavı sonuçlarınızı kaydedin ve analiz edin" />
      </Head>
      
      <main className={styles.main}>
        <h1 ref={titleRef} className={styles.title}>Deneme Sınavı Takibi</h1>
        
        {/* Hata ve Başarı Mesajları */}
        {error && (
          <div className={styles.alert + ' ' + styles.alertError}>
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className={styles.closeBtn}>×</button>
          </div>
        )}
        
        {success && (
          <div className={styles.alert + ' ' + styles.alertSuccess}>
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} className={styles.closeBtn}>×</button>
          </div>
        )}
        
        <div ref={formRef} className={styles.grid}>
          {/* Deneme Bilgileri */}
          <div className={styles.card}>
            <h2>Deneme Bilgileri</h2>
            <div className={styles.formGroup}>
              <label>Deneme Adı:</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Örn: Ders Hocası 1. Deneme"
                className={`input ${validationErrors.examName ? styles.inputError : ''}`}
              />
              {validationErrors.examName && (
                <span className={styles.errorText}>{validationErrors.examName}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label>Deneme Tarihi:</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                className={`input ${validationErrors.examDate ? styles.inputError : ''}`}
              />
              {validationErrors.examDate && (
                <span className={styles.errorText}>{validationErrors.examDate}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label>Alan Türü:</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="input"
              >
                <option value="sayisal">Sayısal</option>
                <option value="esit_agirlik">Eşit Ağırlık</option>
                <option value="sozel">Sözel</option>
                <option value="tyt_only">Sadece TYT</option>
                <option value="ayt_sayisal">Sadece AYT - Sayısal</option>
                <option value="ayt_esit_agirlik">Sadece AYT - Eşit Ağırlık</option>
                <option value="ayt_sozel">Sadece AYT - Sözel</option>
              </select>
            </div>
          </div>
          
          {/* TYT Sonuçları */}
          {!examType.startsWith('ayt_') && (
          <div className={styles.card}>
            <h2>TYT Sonuçları</h2>
            
            {['turkce', 'matematik', 'fen', 'sosyal'].map(subject => {
              const subjectNames = {
                turkce: 'Türkçe',
                matematik: 'Matematik',
                fen: 'Fen Bilimleri',
                sosyal: 'Sosyal Bilimler'
              };
              
              return (
                <div key={subject} className={styles.subjectRow}>
                  <span className={styles.subjectName}>{subjectNames[subject]}</span>
                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      min="0"
                      max={subject === 'turkce' || subject === 'matematik' ? '40' : '20'}
                      value={tytAnswers[`${subject}_dogru`]}
                      onChange={(e) => handleTytChange(`${subject}_dogru`, e.target.value)}
                      placeholder="Doğru"
                      className="input"
                    />
                    <input
                      type="number"
                      min="0"
                      max={subject === 'turkce' || subject === 'matematik' ? '40' : '20'}
                      value={tytAnswers[`${subject}_yanlis`]}
                      onChange={(e) => handleTytChange(`${subject}_yanlis`, e.target.value)}
                      placeholder="Yanlış"
                      className="input"
                    />
                    <span className={styles.netScore}>
                      Net: {currentScore.tyt[`${subject}_net`]?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              );
            })}
            
            <div className={styles.totalScore}>
              <strong>Toplam TYT Net: {currentScore.tyt.toplam_net.toFixed(1)}</strong>
              <strong>TYT Puanı: {currentScore.tyt.tyt_ham_puan.toFixed(1)}</strong>
            </div>
          </div>
          )}
          
          {/* AYT Sonuçları */}
          {examType !== 'tyt_only' && (
          <div className={styles.card}>
            <h2>AYT Sonuçları ({examType === 'sayisal' || examType === 'ayt_sayisal' ? 'Sayısal' : examType === 'esit_agirlik' || examType === 'ayt_esit_agirlik' ? 'Eşit Ağırlık' : examType === 'sozel' || examType === 'ayt_sozel' ? 'Sözel' : 'AYT'})</h2>
            
            {(examType === 'sayisal' || examType === 'ayt_sayisal') && (
              <>
                {['matematik', 'fizik', 'kimya', 'biyoloji'].map(subject => {
                  const subjectNames = {
                    matematik: 'Matematik',
                    fizik: 'Fizik',
                    kimya: 'Kimya',
                    biyoloji: 'Biyoloji'
                  };
                  
                  const maxQuestions = {
                    matematik: 40,
                    fizik: 14,
                    kimya: 13,
                    biyoloji: 13
                  };
                  
                  return (
                    <div key={subject} className={styles.subjectRow}>
                      <span className={styles.subjectName}>{subjectNames[subject]}</span>
                      <div className={styles.inputGroup}>
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_dogru`]}
                          onChange={(e) => handleAytChange(`${subject}_dogru`, e.target.value)}
                          placeholder="Doğru"
                          className="input"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_yanlis`]}
                          onChange={(e) => handleAytChange(`${subject}_yanlis`, e.target.value)}
                          placeholder="Yanlış"
                          className="input"
                        />
                        <span className={styles.netScore}>
                          Net: {currentScore.ayt[`${subject}_net`]?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            {(examType === 'esit_agirlik' || examType === 'ayt_esit_agirlik') && (
              <>
                {['matematik', 'edebiyat', 'tarih1', 'cografya1'].map(subject => {
                  const subjectNames = {
                    matematik: 'Matematik',
                    edebiyat: 'Edebiyat',
                    tarih1: 'Tarih-1',
                    cografya1: 'Coğrafya-1'
                  };
                  
                  const maxQuestions = {
                    matematik: 40,
                    edebiyat: 24,
                    tarih1: 10,
                    cografya1: 6
                  };
                  
                  return (
                    <div key={subject} className={styles.subjectRow}>
                      <span className={styles.subjectName}>{subjectNames[subject]}</span>
                      <div className={styles.inputGroup}>
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_dogru`]}
                          onChange={(e) => handleAytChange(`${subject}_dogru`, e.target.value)}
                          placeholder="Doğru"
                          className="input"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_yanlis`]}
                          onChange={(e) => handleAytChange(`${subject}_yanlis`, e.target.value)}
                          placeholder="Yanlış"
                          className="input"
                        />
                        <span className={styles.netScore}>
                          Net: {currentScore.ayt[`${subject}_net`]?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            {(examType === 'sozel' || examType === 'ayt_sozel') && (
              <>
                {['edebiyat', 'tarih1', 'cografya1', 'tarih2', 'cografya2', 'felsefe', 'din'].map(subject => {
                  const subjectNames = {
                    edebiyat: 'Edebiyat',
                    tarih1: 'Tarih-1',
                    cografya1: 'Coğrafya-1',
                    tarih2: 'Tarih-2',
                    cografya2: 'Coğrafya-2',
                    felsefe: 'Felsefe',
                    din: 'Din Kültürü'
                  };
                  
                  const maxQuestions = {
                    edebiyat: 24,
                    tarih1: 10,
                    cografya1: 6,
                    tarih2: 11,
                    cografya2: 11,
                    felsefe: 12,
                    din: 6
                  };
                  
                  return (
                    <div key={subject} className={styles.subjectRow}>
                      <span className={styles.subjectName}>{subjectNames[subject]}</span>
                      <div className={styles.inputGroup}>
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_dogru`]}
                          onChange={(e) => handleAytChange(`${subject}_dogru`, e.target.value)}
                          placeholder="Doğru"
                          className="input"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxQuestions[subject]}
                          value={aytAnswers[`${subject}_yanlis`]}
                          onChange={(e) => handleAytChange(`${subject}_yanlis`, e.target.value)}
                          placeholder="Yanlış"
                          className="input"
                        />
                        <span className={styles.netScore}>
                          Net: {currentScore.ayt[`${subject}_net`]?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            <div className={styles.totalScore}>
              <strong>Toplam AYT Net: {currentScore.ayt.toplam_net.toFixed(1)}</strong>
              <strong>AYT Puanı: {currentScore.ayt.ayt_ham_puan.toFixed(1)}</strong>
            </div>
          </div>
          )}
          
          {/* OBP ve Sonuç */}
          <div className={styles.card}>
            <h2>OBP ve Yerleştirme Puanı</h2>
            
            <div className={styles.formGroup}>
              <label>Diploma Notu:</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={obpData.diplomaNotu}
                onChange={(e) => setObpData(prev => ({ ...prev, diplomaNotu: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Lise Türü:</label>
              <select
                value={obpData.liseType}
                onChange={(e) => setObpData(prev => ({ ...prev, liseType: e.target.value }))}
                className="input"
              >
                <option value="anadolu">Anadolu Lisesi</option>
                <option value="meslek">Meslek Lisesi</option>
                <option value="imam_hatip">İmam Hatip Lisesi</option>
                <option value="guzel_sanatlar">Güzel Sanatlar Lisesi</option>
                <option value="spor">Spor Lisesi</option>
              </select>
            </div>
            
            <div ref={scoreRef} className={styles.scoreResults}>
              <div className={styles.scoreItem}>
                <span>OBP:</span>
                <strong>{currentScore.obp.toFixed(2)}</strong>
              </div>
              <div className={styles.scoreItem}>
                <span>Yerleştirme Puanı:</span>
                <strong>{currentScore.yerlestirme_puani.toFixed(2)}</strong>
              </div>
            </div>
            
            {validationErrors.answers && (
              <div className={styles.errorText}>
                {validationErrors.answers}
              </div>
            )}
            
            <button
              onClick={saveExamResult}
              disabled={saving || !user}
              className={`btn ${saving ? styles.btnLoading : ''}`}
            >
              {saving ? (
                <>
                  <span className={styles.spinner}></span>
                  Kaydediliyor...
                </>
              ) : (
                'Sonucu Kaydet'
              )}
            </button>
            
            {!user && (
              <p className={styles.loginWarning}>
                Sonuçları kaydetmek için giriş yapmanız gerekiyor.
              </p>
            )}
          </div>
        </div>
        
        {/* Geçmiş Sonuçlar */}
        {results.length > 0 && (
          <div ref={historyRef} className={styles.historySection}>
            <div className={styles.historySectionHeader}>
              <h2>📊 Geçmiş Deneme Sonuçları</h2>
              <p className={styles.historySubtitle}>Performansınızı takip edin ve gelişiminizi görün</p>
            </div>
            <div className={styles.resultsGrid}>
              {results.map((result, index) => (
                <div key={result.id} className={styles.resultCard} style={{'--delay': `${index * 0.1}s`}}>
                  <div className={styles.resultCardHeader}>
                    <div className={styles.examInfo}>
                      <h3>{result.exam_name}</h3>
                      <span className={styles.examDate}>
                        📅 {new Date(result.exam_date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className={styles.examType}>
                      <span className={styles.typeTag}>{result.exam_type?.toUpperCase() || 'TYT+AYT'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.resultScores}>
                    <div className={styles.scoreItem}>
                      <div className={styles.scoreLabel}>TYT Net</div>
                      <div className={styles.scoreValue}>{result.tyt_net?.toFixed(1) || '0.0'}</div>
                    </div>
                    <div className={styles.scoreItem}>
                      <div className={styles.scoreLabel}>AYT Net</div>
                      <div className={styles.scoreValue}>{result.ayt_net?.toFixed(1) || '0.0'}</div>
                    </div>
                    <div className={styles.scoreItem + ' ' + styles.mainScore}>
                      <div className={styles.scoreLabel}>Yerleştirme Puanı</div>
                      <div className={styles.scoreValue}>{result.yerlestirme_puani?.toFixed(1) || '0.0'}</div>
                    </div>
                  </div>
                  
                  <div className={styles.resultActions}>
                    <button 
                      className={styles.actionBtn + ' ' + styles.viewBtn}
                      onClick={() => handleViewDetail(result)}
                    >
                      👁️ Detay
                    </button>
                    <button 
                      className={styles.actionBtn + ' ' + styles.editBtn}
                      onClick={() => handleEditResult(result)}
                    >
                      ✏️ Düzenle
                    </button>
                    <button 
                      className={styles.actionBtn + ' ' + styles.deleteBtn}
                      onClick={() => handleDeleteResult(result.id)}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Düzenleme Modalı */}
        {showEditModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Deneme Sonucunu Düzenle</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={cancelEdit}
                >×</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Deneme Adı</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className={validationErrors.examName ? 'input error' : 'input'}
                    placeholder="Örn: TYT Deneme 1"
                  />
                  {validationErrors.examName && (
                    <span className={styles.errorText}>{validationErrors.examName}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label>Deneme Tarihi</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className={validationErrors.examDate ? 'input error' : 'input'}
                  />
                  {validationErrors.examDate && (
                    <span className={styles.errorText}>{validationErrors.examDate}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label>Sınav Türü</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="input"
                  >
                    <option value="sayisal">Sayısal (MF)</option>
                    <option value="esit_agirlik">Eşit Ağırlık (TM)</option>
                    <option value="sozel">Sözel (TS)</option>
                    <option value="dil">Dil (DİL)</option>
                  </select>
                </div>
                
                <p className={styles.modalNote}>
                  Not: Soru cevaplarını ana formdan düzenleyebilirsiniz.
                </p>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.btn + ' ' + styles.btnSecondary}
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  İptal
                </button>
                <button 
                  className={styles.btn + ' ' + styles.btnPrimary}
                  onClick={handleUpdateResult}
                  disabled={saving}
                >
                  {saving ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Detay Modalı */}
        {showDetailModal && selectedResult && (
          <div className={styles.modal}>
            <div className={styles.modalContent + ' ' + styles.detailModal}>
              <div className={styles.modalHeader}>
                <h2>{selectedResult.exam_name} - Detaylı Rapor</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setShowDetailModal(false)}
                >×</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.detailGrid}>
                  <div className={styles.detailSection}>
                    <h3>Genel Bilgiler</h3>
                    <div className={styles.detailItem}>
                      <span>Tarih:</span>
                      <span>{new Date(selectedResult.exam_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Sınav Türü:</span>
                      <span>{selectedResult.exam_type === 'sayisal' ? 'Sayısal (MF)' : 
                             selectedResult.exam_type === 'esit_agirlik' ? 'Eşit Ağırlık (TM)' :
                             selectedResult.exam_type === 'sozel' ? 'Sözel (TS)' : 'Dil (DİL)'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3>TYT Sonuçları</h3>
                    <div className={styles.subjectDetail}>
                      <span>Türkçe:</span>
                      <span>{selectedResult.tyt_turkce_dogru}D - {selectedResult.tyt_turkce_yanlis}Y</span>
                      <span>Net: {((selectedResult.tyt_turkce_dogru || 0) - (selectedResult.tyt_turkce_yanlis || 0) * 0.25).toFixed(1)}</span>
                    </div>
                    <div className={styles.subjectDetail}>
                      <span>Matematik:</span>
                      <span>{selectedResult.tyt_matematik_dogru}D - {selectedResult.tyt_matematik_yanlis}Y</span>
                      <span>Net: {((selectedResult.tyt_matematik_dogru || 0) - (selectedResult.tyt_matematik_yanlis || 0) * 0.25).toFixed(1)}</span>
                    </div>
                    <div className={styles.subjectDetail}>
                      <span>Fen:</span>
                      <span>{selectedResult.tyt_fen_dogru}D - {selectedResult.tyt_fen_yanlis}Y</span>
                      <span>Net: {((selectedResult.tyt_fen_dogru || 0) - (selectedResult.tyt_fen_yanlis || 0) * 0.25).toFixed(1)}</span>
                    </div>
                    <div className={styles.subjectDetail}>
                      <span>Sosyal:</span>
                      <span>{selectedResult.tyt_sosyal_dogru}D - {selectedResult.tyt_sosyal_yanlis}Y</span>
                      <span>Net: {((selectedResult.tyt_sosyal_dogru || 0) - (selectedResult.tyt_sosyal_yanlis || 0) * 0.25).toFixed(1)}</span>
                    </div>
                    <div className={styles.totalScore}>
                      <span>TYT Toplam Net:</span>
                      <span>{selectedResult.tyt_net?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3>AYT Sonuçları</h3>
                    {selectedResult.exam_type === 'sayisal' && (
                      <>
                        <div className={styles.subjectDetail}>
                          <span>Matematik:</span>
                          <span>{selectedResult.ayt_matematik_dogru}D - {selectedResult.ayt_matematik_yanlis}Y</span>
                          <span>Net: {((selectedResult.ayt_matematik_dogru || 0) - (selectedResult.ayt_matematik_yanlis || 0) * 0.25).toFixed(1)}</span>
                        </div>
                        <div className={styles.subjectDetail}>
                          <span>Fizik:</span>
                          <span>{selectedResult.ayt_fizik_dogru}D - {selectedResult.ayt_fizik_yanlis}Y</span>
                          <span>Net: {((selectedResult.ayt_fizik_dogru || 0) - (selectedResult.ayt_fizik_yanlis || 0) * 0.25).toFixed(1)}</span>
                        </div>
                        <div className={styles.subjectDetail}>
                          <span>Kimya:</span>
                          <span>{selectedResult.ayt_kimya_dogru}D - {selectedResult.ayt_kimya_yanlis}Y</span>
                          <span>Net: {((selectedResult.ayt_kimya_dogru || 0) - (selectedResult.ayt_kimya_yanlis || 0) * 0.25).toFixed(1)}</span>
                        </div>
                        <div className={styles.subjectDetail}>
                          <span>Biyoloji:</span>
                          <span>{selectedResult.ayt_biyoloji_dogru}D - {selectedResult.ayt_biyoloji_yanlis}Y</span>
                          <span>Net: {((selectedResult.ayt_biyoloji_dogru || 0) - (selectedResult.ayt_biyoloji_yanlis || 0) * 0.25).toFixed(1)}</span>
                        </div>
                      </>
                    )}
                    <div className={styles.totalScore}>
                      <span>AYT Toplam Net:</span>
                      <span>{selectedResult.ayt_net?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3>Puanlar</h3>
                    <div className={styles.scoreDetail}>
                      <span>TYT Puanı:</span>
                      <span>{selectedResult.tyt_puan?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className={styles.scoreDetail}>
                      <span>AYT Puanı:</span>
                      <span>{selectedResult.ayt_puan?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className={styles.scoreDetail}>
                      <span>OBP:</span>
                      <span>{selectedResult.obp?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className={styles.totalScore}>
                      <span>Yerleştirme Puanı:</span>
                      <span>{selectedResult.yerlestirme_puani?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.btn + ' ' + styles.btnPrimary}
                  onClick={() => setShowDetailModal(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabase';
import styles from '../styles/Takvim.module.css';

export default function Takvim() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'task', // task, goal, exam, study
    priority: 'medium',
    color: '#667eea'
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // GSAP refs
  const titleRef = useRef(null);
  const calendarRef = useRef(null);
  const sidebarRef = useRef(null);

  // Event types with colors and icons
  const eventTypes = {
    task: { label: 'Görev', icon: '📝', color: '#3b82f6' },
    goal: { label: 'Hedef', icon: '🎯', color: '#10b981' },
    exam: { label: 'Sınav', icon: '📚', color: '#ef4444' },
    study: { label: 'Çalışma', icon: '📖', color: '#f59e0b' },
    meeting: { label: 'Toplantı', icon: '👥', color: '#8b5cf6' },
    reminder: { label: 'Hatırlatma', icon: '⏰', color: '#06b6d4' }
  };

  // Renk seçenekleri - etkinlik türüne göre
  const colorOptions = [
    { value: '#3b82f6', label: 'Mavi', type: 'task' },
    { value: '#10b981', label: 'Yeşil', type: 'goal' },
    { value: '#ef4444', label: 'Kırmızı', type: 'exam' },
    { value: '#f59e0b', label: 'Turuncu', type: 'study' },
    { value: '#8b5cf6', label: 'Mor', type: 'meeting' },
    { value: '#06b6d4', label: 'Cyan', type: 'reminder' }
  ];

  // Etkinlik türü renk eşleştirmesi
  const getEventTypeColor = (eventType) => {
    return eventTypes[eventType]?.color || '#3b82f6';
  };

  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936', 
    high: '#f56565'
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadEvents(session.user.id);
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        loadEvents(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setEvents([]);
      }
    });
    
    setLoading(false);
    
    // GSAP animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(calendarRef.current,
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(sidebarRef.current,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadEvents = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Etkinlikler yüklenirken hata oluştu');
    }
  };

  const saveEvent = async () => {
    if (!user) {
      setError('Etkinlik kaydetmek için giriş yapmanız gerekiyor');
      return;
    }

    if (!eventForm.title || !eventForm.date) {
      setError('Başlık ve tarih alanları zorunludur');
      return;
    }

    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time || null,
        event_type: eventForm.type,
        priority: eventForm.priority,
        color: getEventTypeColor(eventForm.type),
        user_id: user.id
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) throw error;
        setSuccess('Etkinlik başarıyla güncellendi!');
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([eventData]);
        if (error) throw error;
        setSuccess('Etkinlik başarıyla eklendi!');
      }

      loadEvents(user.id);
      closeEventModal();
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Etkinlik kaydedilirken hata oluştu');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
      
      setSuccess('Etkinlik başarıyla silindi!');
      loadEvents(user.id);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Etkinlik silinirken hata oluştu');
    }
  };

  const openEventModal = (date = null, event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time || '',
        type: event.event_type,
        priority: event.priority,
        color: event.color
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        date: date ? date.toISOString().split('T')[0] : '',
        time: '',
        type: 'task',
        priority: 'medium',
        color: '#667eea'
      });
    }
    setShowEventModal(true);
    
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

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'task',
      priority: 'medium',
      color: '#667eea'
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert to Monday = 0, Sunday = 6 format
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${
            isToday ? styles.today : ''
          } ${isSelected ? styles.selected : ''}`}
          onClick={() => {
            setSelectedDate(date);
            if (dayEvents.length === 0) {
              openEventModal(date);
            }
          }}
        >
          <span className={styles.dayNumber}>{day}</span>
          {dayEvents.length > 0 && (
            <div className={styles.eventIndicators}>
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={styles.eventDot}
                  style={{ 
                    backgroundColor: getEventTypeColor(event.event_type)
                  }}
                  title={`${eventTypes[event.event_type]?.icon || '📌'} ${event.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEventModal(null, event);
                  }}
                >
                  <span className={styles.eventIcon}>
                    {eventTypes[event.event_type]?.icon || '📌'}
                  </span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <span className={styles.moreEvents}>+{dayEvents.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    }).sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time || '00:00'}`);
      const bDateTime = new Date(`${b.date}T${b.time || '00:00'}`);
      return aDateTime - bDateTime;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > today && eventDate <= nextWeek;
    }).sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time || '00:00'}`);
      const bDateTime = new Date(`${b.date}T${b.time || '00:00'}`);
      return aDateTime - bDateTime;
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Takvim - StudyFlow</title>
        <meta name="description" content="Görevlerinizi ve hedeflerinizi takvimde organize edin" />
      </Head>

      <main className={styles.main}>
        <h1 ref={titleRef} className={styles.title}>📅 Takvim</h1>

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

        <div className={styles.calendarLayout}>
          {/* Ana Takvim */}
          <div ref={calendarRef} className={styles.calendarSection}>
            <div className={styles.calendarHeader}>
              <button 
                className={styles.navBtn}
                onClick={() => navigateMonth(-1)}
              >
                ←
              </button>
              <h2 className={styles.monthYear}>
                {currentDate.toLocaleDateString('tr-TR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <button 
                className={styles.navBtn}
                onClick={() => navigateMonth(1)}
              >
                →
              </button>
            </div>

            <div className={styles.calendarGrid}>
              <div className={styles.weekDays}>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                  <div key={day} className={styles.weekDay}>{day}</div>
                ))}
              </div>
              <div className={styles.monthDays}>
                {renderCalendarDays()}
              </div>
            </div>

            <button 
              className={styles.addEventBtn}
              onClick={() => openEventModal()}
            >
              + Etkinlik Ekle
            </button>
          </div>

          {/* Yan Panel */}
          <div ref={sidebarRef} className={styles.sidebar}>
            {/* Bugünün Etkinlikleri */}
            <div className={styles.sidebarSection}>
              <h3>🌟 Bugün</h3>
              {getTodayEvents().length > 0 ? (
                <div className={styles.eventsList}>
                  {getTodayEvents().map(event => (
                    <div 
                      key={event.id} 
                      className={styles.eventItem}
                      onClick={() => openEventModal(null, event)}
                    >
                      <div 
                        className={styles.eventColor}
                        style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                      ></div>
                      <div className={styles.eventInfo}>
                        <div className={styles.eventTitleSection}>
                          <div 
                            className={styles.eventTypeIndicator}
                            style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                          >
                            {eventTypes[event.event_type]?.icon || '📌'}
                          </div>
                          <span className={styles.eventTitle}>{event.title}</span>
                        </div>
                        <span className={styles.eventTime}>
                          {event.time ? event.time : 'Tüm gün'}
                        </span>
                        {event.priority && (
                          <div className={`${styles.priorityBadge} ${styles[`priority${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`]}`}>
                            {event.priority === 'high' ? '🔴' : event.priority === 'medium' ? '🟡' : '🟢'} {event.priority.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noEvents}>Bugün etkinlik yok</p>
              )}
            </div>

            {/* Yaklaşan Etkinlikler */}
            <div className={styles.sidebarSection}>
              <h3>⏰ Yaklaşan</h3>
              {getUpcomingEvents().length > 0 ? (
                <div className={styles.eventsList}>
                  {getUpcomingEvents().slice(0, 5).map(event => (
                    <div 
                      key={event.id} 
                      className={styles.eventItem}
                      onClick={() => openEventModal(null, event)}
                    >
                      <div 
                        className={styles.eventColor}
                        style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                      ></div>
                      <div className={styles.eventInfo}>
                        <div className={styles.eventTitleSection}>
                          <div 
                            className={styles.eventTypeIndicator}
                            style={{ backgroundColor: getEventTypeColor(event.type) }}
                          >
                            {eventTypes[event.type]?.icon || '📌'}
                          </div>
                          <span className={styles.eventTitle}>{event.title}</span>
                        </div>
                        <span className={styles.eventTime}>
                          {new Date(event.date).toLocaleDateString('tr-TR')}
                          {event.time && ` - ${event.time}`}
                        </span>
                        {event.priority && (
                          <div className={`${styles.priorityBadge} ${styles[`priority${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`]}`}>
                            {event.priority === 'high' ? '🔴' : event.priority === 'medium' ? '🟡' : '🟢'} {event.priority.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noEvents}>Yaklaşan etkinlik yok</p>
              )}
            </div>

            {/* Etkinlik Türleri Göstergesi */}
            <div className={styles.sidebarSection}>
              <h3>🏷️ Türler</h3>
              <div className={styles.eventTypes}>
                {Object.entries(eventTypes).map(([key, type]) => (
                  <div key={key} className={styles.eventType}>
                    <div 
                      className={styles.typeColor}
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <span>{type.icon} {type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Etkinlik Modal */}
        {showEventModal && (
          <div className={styles.modal} onClick={closeEventModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</h3>
                <button className={styles.closeBtn} onClick={closeEventModal}>×</button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Başlık *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Etkinlik başlığı"
                    className="input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Açıklama</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Etkinlik açıklaması"
                    className="input"
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tarih *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      className="input"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Saat</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tür</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ 
                        ...prev, 
                        type: e.target.value,
                        color: getEventTypeColor(e.target.value)
                      }))}
                      className="input"
                    >
                      {Object.entries(eventTypes).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Öncelik</label>
                    <select
                      value={eventForm.priority}
                      onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="input"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Renk (Otomatik)</label>
                  <div className={styles.colorPreview}>
                    <div 
                      className={styles.selectedColor}
                      style={{ backgroundColor: getEventTypeColor(eventForm.type) }}
                    >
                      {eventTypes[eventForm.type]?.icon} {eventTypes[eventForm.type]?.label}
                    </div>
                    <small>Renk etkinlik türüne göre otomatik olarak belirlenir</small>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                {editingEvent && (
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => {
                      deleteEvent(editingEvent.id);
                      closeEventModal();
                    }}
                  >
                    Sil
                  </button>
                )}
                <button className={styles.cancelBtn} onClick={closeEventModal}>
                  İptal
                </button>
                <button className={styles.saveBtn} onClick={saveEvent}>
                  {editingEvent ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
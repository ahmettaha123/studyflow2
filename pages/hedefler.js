// import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import styles from '../styles/Hedefler.module.css';
import GoalDetailModal from '../components/GoalDetailModal';
import TodoDetailModal from '../components/TodoDetailModal';

export default function Hedefler() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('goals'); // 'goals' or 'todos'
  
  // Modal state'leri
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  
  // Filtreleme state'leri kaldırıldı - kullanıcı deneyimini basitleştirmek için
  
  // Hedef formu state'leri
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_value: '',
    target_date: '',
    goal_type: 'score'
  });
  
  // Todo formu state'leri
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: 'study' // 'study', 'exam', 'personal'
  });
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadGoals(session.user.id);
        await loadTodos(session.user.id);
      }
      setLoading(false);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadGoals(session.user.id);
        loadTodos(session.user.id);
      } else {
        setGoals([]);
        setTodos([]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const loadGoals = async (userId) => {
    try {
      console.log('Hedefler yükleniyor, userId:', userId);
      
      const { data: goalData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Hedefler yüklenirken hata:', error);
        setGoals([]);
        return;
      }
      
      console.log('Hedefler başarıyla yüklendi:', goalData?.length || 0, 'adet');
      setGoals(goalData || []);
    } catch (error) {
      console.error('Hedefler yüklenirken hata:', error);
      setGoals([]);
    }
  };
  
  const loadTodos = async (userId) => {
    try {
      const { data: todoData, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Görevler yüklenirken hata:', error);
        setTodos([]);
        return;
      }
      
      setTodos(todoData || []);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
      setTodos([]);
    }
  };
  
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Lütfen önce giriş yapın.');
      return;
    }
    
    if (!goalForm.title.trim()) {
      alert('Hedef başlığı boş olamaz.');
      return;
    }
    
    try {
      // Veritabanı şemasına uygun olan alanları gönder
      const goalData = {
        title: goalForm.title.trim(),
        description: goalForm.description.trim(),
        goal_type: goalForm.goal_type,
        target_value: goalForm.target_value ? parseInt(goalForm.target_value) : null,
        current_value: 0,
        target_date: goalForm.target_date || null,
        is_completed: false,
        user_id: user.id
      };
      
      console.log('Hedef ekleniyor:', goalData);
      
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select();
      
      if (error) {
        console.error('Supabase hatası:', error);
        throw error;
      }
      
      console.log('Hedef başarıyla eklendi:', data);
      
      // Hedefleri yeniden yükle
      await loadGoals(user.id);
      
      // Formu sıfırla
      setGoalForm({
        title: '',
        description: '',
        target_value: '',
        target_date: '',
        goal_type: 'score'
      });
      setShowGoalForm(false);
      
      alert('Hedef başarıyla eklendi!');
    } catch (error) {
      console.error('Hedef eklenirken hata:', error);
      alert(`Hedef eklenirken bir hata oluştu: ${error.message}`);
    }
  };
  
  const handleTodoSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const todoData = {
        ...todoForm,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('todos')
        .insert([todoData]);
      
      if (error) throw error;
      await loadTodos(user.id);
      
      // Formu sıfırla
      setTodoForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'study'
      });
      setShowTodoForm(false);
    } catch (error) {
      console.error('Görev eklenirken hata:', error);
      alert('Görev eklenirken bir hata oluştu.');
    }
  };
  
  const toggleGoalStatus = async (goalId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('goals')
        .update({ is_completed: newStatus, updated_at: new Date().toISOString() })
        .eq('id', goalId);
      
      if (error) throw error;
      await loadGoals(user.id);
    } catch (error) {
      console.error('Hedef durumu güncellenirken hata:', error);
    }
  };
  
  const toggleTodoStatus = async (todoId, currentStatus) => {
    try {
      const newIsCompleted = currentStatus !== 'completed';
      const updateData = { 
        is_completed: newIsCompleted,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todoId);
      
      if (error) throw error;
      await loadTodos(user.id);
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      alert('Görev durumu güncellenirken bir hata oluştu.');
    }
  };
  
  const deleteGoal = async (goalId) => {
    if (!confirm('Bu hedefi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      await loadGoals(user.id);
    } catch (error) {
      console.error('Hedef silinirken hata:', error);
    }
  };
  
  const deleteTodo = async (todoId) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);
      
      if (error) throw error;
      await loadTodos(user.id);
    } catch (error) {
      console.error('Görev silinirken hata:', error);
    }
  };
  
  // Modal fonksiyonları
  const openGoalModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };
  
  const closeGoalModal = () => {
    setSelectedGoal(null);
    setShowGoalModal(false);
  };
  
  const openTodoModal = (todo) => {
    setSelectedTodo(todo);
    setShowTodoModal(true);
  };
  
  const closeTodoModal = () => {
    setSelectedTodo(null);
    setShowTodoModal(false);
  };
  
  const updateGoal = async (goalId, updateData) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId);
      
      if (error) throw error;
      await loadGoals(user.id);
    } catch (error) {
      console.error('Hedef güncellenirken hata:', error);
      throw error;
    }
  };
  
  const updateTodo = async (todoId, updateData) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todoId);
      
      if (error) throw error;
      await loadTodos(user.id);
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      throw error;
    }
  };
  
  // Basit listeleme - filtreleme kaldırıldı
  const getGoals = () => goals;
  const getTodos = () => todos;
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  const getCategoryIcon = (goal_type) => {
    switch (goal_type) {
      case 'tyt': return '📚';
      case 'ayt': return '🔬';
      case 'yerlestirime': return '🎯';
      case 'study': return '📖';
      case 'exam': return '📝';
      case 'personal': return '👤';
      default: return '📋';
    }
  };
  
  const getGoalProgress = (goal) => {
    // Bu fonksiyon gerçek uygulamada kullanıcının mevcut performansına göre hesaplanacak
    // Şimdilik basit bir hesaplama yapıyoruz
    if (goal.is_completed) return 100;
    
    const targetDate = new Date(goal.target_date);
    const startDate = new Date(goal.created_at);
    const currentDate = new Date();
    
    const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
    const passedDays = (currentDate - startDate) / (1000 * 60 * 60 * 24);
    
    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
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
          <p>Hedefler ve görevler sayfasını görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Hedefler ve Görevler - StudyFlow</title>
        <meta name="description" content="Hedeflerinizi belirleyin ve görevlerinizi takip edin" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Hedefler ve Görevler</h1>
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'goals' ? styles.active : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Hedefler ({goals.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'todos' ? styles.active : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            ✅ Görevler ({todos.filter(t => !t.is_completed).length})
          </button>
        </div>
        
        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Hedeflerim</h2>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className={styles.addButton}
              >
                {showGoalForm ? '❌ İptal' : '➕ Yeni Hedef'}
              </button>
            </div>
            
            {/* Filtreleme kaldırıldı - daha temiz arayüz için */}
            
            {/* Goal Form */}
            {showGoalForm && (
              <form onSubmit={handleGoalSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Hedef Başlığı *</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="Örn: TYT Matematik 35 net"
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Hedef Puan/Net</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      value={goalForm.target_value}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Sadece sayılara izin ver
                        if (value === '' || /^\d+$/.test(value)) {
                          setGoalForm(prev => ({ ...prev, target_value: value }));
                        }
                      }}
                      placeholder="Örn: 35"
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Hedef Tarihi</label>
                    <input
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Kategori</label>
                    <select
                      value={goalForm.goal_type}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, goal_type: e.target.value }))}
                      className={styles.select}
                    >
                      <option value="score">Puan Hedefi</option>
                      <option value="rank">Sıralama Hedefi</option>
                      <option value="study_time">Çalışma Süresi</option>
                      <option value="custom">Özel Hedef</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Açıklama</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Hedef hakkında detaylar..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  Hedef Ekle
                </button>
              </form>
            )}
            
            {/* Goals List */}
            <div className={styles.itemsGrid}>
              {getGoals().length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>Henüz hedef eklenmemiş</h3>
                  <p>İlk hedefinizi ekleyerek başlayın!</p>
                </div>
              ) : (
                getGoals().map(goal => {
                  return (
                    <div 
                      key={goal.id} 
                      className={`${styles.itemCard} ${goal.is_completed ? styles.completed : ''}`}
                      onClick={() => openGoalModal(goal)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>
                          <span className={styles.categoryIcon}>{getCategoryIcon(goal.goal_type || goal.category)}</span>
                          <h3>{goal.title}</h3>
                        </div>
                        <div className={styles.itemActions}>
                          <div
                            className={styles.priorityDot}
                            style={{ backgroundColor: getPriorityColor(goal.priority) }}
                            title={`Öncelik: ${goal.priority}`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGoalStatus(goal.id, goal.is_completed);
                            }}
                            className={styles.toggleButton}
                            title={goal.is_completed ? 'Aktif yap' : 'Tamamlandı olarak işaretle'}
                          >
                            {goal.is_completed ? '↩️' : '✅'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGoal(goal.id);
                            }}
                            className={styles.deleteButton}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {goal.description && (
                        <p className={styles.itemDescription}>{goal.description}</p>
                      )}
                      
                      <div className={styles.goalDetails}>
                        {goal.target_value && (
                          <span className={styles.targetScore}>Hedef: {goal.target_value}</span>
                        )}
                        {goal.target_date && (
                          <span className={styles.targetDate}>
                            📅 {new Date(goal.target_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.progressContainer}>
                        <div className={styles.progressLabel}>
                          İlerleme: {Math.round(getGoalProgress(goal))}%
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${getGoalProgress(goal)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className={styles.clickHint}>
                        Detaylar için tıklayın
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {/* Todos Tab */}
        {activeTab === 'todos' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Görevlerim</h2>
              <button
                onClick={() => setShowTodoForm(!showTodoForm)}
                className={styles.addButton}
              >
                {showTodoForm ? '❌ İptal' : '➕ Yeni Görev'}
              </button>
            </div>
            

            
            {/* Todo Form */}
            {showTodoForm && (
              <form onSubmit={handleTodoSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Görev Başlığı *</label>
                    <input
                      type="text"
                      value={todoForm.title}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="Örn: Matematik konu tekrarı"
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Kategori</label>
                    <select
                      value={todoForm.category}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, category: e.target.value }))}
                      className={styles.select}
                    >
                      <option value="study">Çalışma</option>
                      <option value="exam">Sınav</option>
                      <option value="personal">Kişisel</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Son Tarih</label>
                    <input
                      type="date"
                      value={todoForm.due_date}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, due_date: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Öncelik</label>
                    <select
                      value={todoForm.priority}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, priority: e.target.value }))}
                      className={styles.select}
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Açıklama</label>
                  <textarea
                    value={todoForm.description}
                    onChange={(e) => setTodoForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Görev hakkında detaylar..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  Görev Ekle
                </button>
              </form>
            )}
            
            {/* Todos List */}
            <div className={styles.itemsGrid}>
              {todos.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>Henüz görev eklenmemiş</h3>
                  <p>İlk görevinizi ekleyerek başlayın!</p>
                </div>
              ) : (
                todos.map(todo => {
                  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.is_completed;
                  return (
                    <div 
                      key={todo.id} 
                      className={`${styles.itemCard} ${todo.is_completed ? styles.completed : ''} ${isOverdue ? styles.overdue : ''}`}
                      onClick={() => openTodoModal(todo)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>
                          <span className={styles.categoryIcon}>{getCategoryIcon(todo.category)}</span>
                          <h3>{todo.title}</h3>
                        </div>
                        <div className={styles.itemActions}>
                          <div
                            className={styles.priorityDot}
                            style={{ backgroundColor: getPriorityColor(todo.priority) }}
                            title={`Öncelik: ${todo.priority}`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTodoStatus(todo.id, todo.is_completed ? 'completed' : 'pending');
                            }}
                            className={styles.toggleButton}
                            title={todo.is_completed ? 'Beklemede yap' : 'Tamamlandı olarak işaretle'}
                          >
                            {todo.is_completed ? '↩️' : '✅'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTodo(todo.id);
                            }}
                            className={styles.deleteButton}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {todo.description && (
                        <p className={styles.itemDescription}>{todo.description}</p>
                      )}
                      
                      {todo.due_date && (
                        <div className={styles.dueDate}>
                          📅 Son Tarih: {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                          {isOverdue && <span className={styles.overdueLabel}>Gecikmiş!</span>}
                        </div>
                      )}
                      
                      <div className={styles.clickHint}>
                        Detaylar için tıklayın
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Modals */}
      {showGoalModal && selectedGoal && (
        <GoalDetailModal
          isOpen={showGoalModal}
          goal={selectedGoal}
          onClose={closeGoalModal}
          onUpdate={updateGoal}
          onDelete={deleteGoal}
        />
      )}
      
      {showTodoModal && selectedTodo && (
        <TodoDetailModal
          isOpen={showTodoModal}
          todo={selectedTodo}
          onClose={closeTodoModal}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onToggleStatus={toggleTodoStatus}
        />
      )}
    </div>
  );
}
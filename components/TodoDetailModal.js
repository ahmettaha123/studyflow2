import { useState } from 'react';
import Modal from './Modal';
import styles from '../styles/DetailModal.module.css';

export default function TodoDetailModal({ isOpen, onClose, todo, onUpdate, onDelete, onToggleStatus }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    due_date: todo?.due_date || '',
    priority: todo?.priority || 'medium',
    category: todo?.category || 'study'
  });

  const handleEdit = () => {
    setEditForm({
      title: todo?.title || '',
      description: todo?.description || '',
      due_date: todo?.due_date || '',
      priority: todo?.priority || 'medium',
      category: todo?.category || 'study'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(todo.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      alert('Görev güncellenirken bir hata oluştu.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: todo?.title || '',
      description: todo?.description || '',
      due_date: todo?.due_date || '',
      priority: todo?.priority || 'medium',
      category: todo?.category || 'study'
    });
  };

  const handleToggleStatus = async () => {
    try {
      await onToggleStatus(todo.id, todo.is_completed ? 'completed' : 'pending');
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      alert('Görev durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await onDelete(todo.id);
        onClose();
      } catch (error) {
        console.error('Görev silinirken hata:', error);
        alert('Görev silinirken bir hata oluştu.');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'study': return 'Çalışma';
      case 'exam': return 'Sınav';
      case 'personal': return 'Kişisel';
      default: return category;
    }
  };

  const getPriorityName = (priority) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'study': return '#3b82f6';
      case 'exam': return '#ef4444';
      case 'personal': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (!todo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Görev Düzenle' : 'Görev Detayları'}>
      <div className={styles.container}>
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className={styles.formGroup}>
              <label>Başlık</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Açıklama</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Son Tarih</label>
              <input
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Kategori</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  <option value="study">Çalışma</option>
                  <option value="exam">Sınav</option>
                  <option value="personal">Kişisel</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Öncelik</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.buttonSecondary} onClick={handleCancel}>
                İptal
              </button>
              <button type="submit" className={styles.buttonPrimary}>
                Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.detailView}>
            <div className={styles.header}>
              <h3 className={styles.title}>{todo.title}</h3>
              <div className={styles.badges}>
                <span className={styles.badge} style={{ backgroundColor: getCategoryColor(todo.category) }}>
                  {getCategoryName(todo.category)}
                </span>
                <span className={styles.badge} style={{ backgroundColor: getPriorityColor(todo.priority) }}>
                  {getPriorityName(todo.priority)}
                </span>
                <span className={`${styles.badge} ${todo.is_completed ? styles.completed : styles.pending}`}>
                  {todo.is_completed ? 'Tamamlandı' : 'Bekliyor'}
                </span>
              </div>
            </div>

            {todo.description && (
              <div className={styles.section}>
                <h4>Açıklama</h4>
                <p>{todo.description}</p>
              </div>
            )}

            <div className={styles.infoGrid}>
              {todo.due_date && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Son Tarih:</span>
                  <span className={styles.value}>{new Date(todo.due_date).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <span className={styles.label}>Oluşturulma:</span>
                <span className={styles.value}>{new Date(todo.created_at).toLocaleDateString('tr-TR')}</span>
              </div>

              {todo.completed_at && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Tamamlanma:</span>
                  <span className={styles.value}>{new Date(todo.completed_at).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.buttonDanger} onClick={handleDelete}>
                Sil
              </button>
              <button 
                className={`${styles.buttonStatus} ${todo.is_completed ? styles.buttonCompleted : styles.buttonPending}`}
                onClick={handleToggleStatus}
              >
                {todo.is_completed ? '↩️ Beklemede Yap' : '✅ Tamamlandı Yap'}
              </button>
              <button className={styles.buttonSecondary} onClick={handleEdit}>
                Düzenle
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
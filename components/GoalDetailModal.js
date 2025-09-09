import { useState } from 'react';
import Modal from './Modal';
import styles from '../styles/DetailModal.module.css';

export default function GoalDetailModal({ isOpen, onClose, goal, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    target_score: goal?.target_score || '',
    target_date: goal?.target_date || '',
    category: goal?.category || 'tyt',
    priority: goal?.priority || 'medium'
  });

  const handleEdit = () => {
    setEditForm({
      title: goal?.title || '',
      description: goal?.description || '',
      target_score: goal?.target_score || '',
      target_date: goal?.target_date || '',
      category: goal?.category || 'tyt',
      priority: goal?.priority || 'medium'
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(goal.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Hedef güncellenirken hata:', error);
      alert('Hedef güncellenirken bir hata oluştu.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: goal?.title || '',
      description: goal?.description || '',
      target_score: goal?.target_score || '',
      target_date: goal?.target_date || '',
      category: goal?.category || 'tyt',
      priority: goal?.priority || 'medium'
    });
  };

  const handleDelete = async () => {
    if (confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      try {
        await onDelete(goal.id);
        onClose();
      } catch (error) {
        console.error('Hedef silinirken hata:', error);
        alert('Hedef silinirken bir hata oluştu.');
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
      case 'tyt': return 'TYT';
      case 'ayt': return 'AYT';
      case 'yerlestirime': return 'Yerleştirme';
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

  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Hedef Düzenle' : 'Hedef Detayları'}>
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

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Hedef Puan</label>
                <input
                  type="number"
                  value={editForm.target_score}
                  onChange={(e) => setEditForm({ ...editForm, target_score: e.target.value })}
                  min="0"
                  max="560"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hedef Tarih</label>
                <input
                  type="date"
                  value={editForm.target_date}
                  onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Kategori</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  <option value="tyt">TYT</option>
                  <option value="ayt">AYT</option>
                  <option value="yerlestirime">Yerleştirme</option>
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
              <h3 className={styles.title}>{goal.title}</h3>
              <div className={styles.badges}>
                <span className={styles.badge} style={{ backgroundColor: getCategoryName(goal.category) === 'TYT' ? '#3b82f6' : getCategoryName(goal.category) === 'AYT' ? '#8b5cf6' : '#10b981' }}>
                  {getCategoryName(goal.category)}
                </span>
                <span className={styles.badge} style={{ backgroundColor: getPriorityColor(goal.priority) }}>
                  {getPriorityName(goal.priority)}
                </span>
                <span className={`${styles.badge} ${goal.status === 'completed' ? styles.completed : styles.active}`}>
                  {goal.status === 'completed' ? 'Tamamlandı' : 'Aktif'}
                </span>
              </div>
            </div>

            {goal.description && (
              <div className={styles.section}>
                <h4>Açıklama</h4>
                <p>{goal.description}</p>
              </div>
            )}

            <div className={styles.infoGrid}>
              {goal.target_score && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Hedef Puan:</span>
                  <span className={styles.value}>{goal.target_score}</span>
                </div>
              )}
              
              {goal.target_date && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Hedef Tarih:</span>
                  <span className={styles.value}>{new Date(goal.target_date).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <span className={styles.label}>Oluşturulma:</span>
                <span className={styles.value}>{new Date(goal.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.buttonDanger} onClick={handleDelete}>
                Sil
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
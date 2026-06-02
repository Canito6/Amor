import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { funService } from '../services/funService';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import BucketCreator from '../components/bucket/BucketCreator';
import BucketCompletionModal from '../components/bucket/BucketCompletionModal';
import BucketCard from '../components/bucket/BucketCard';
import BucketFilters from '../components/bucket/BucketFilters';
import { formatDateLong } from '../utils/dateFormatter';
import { validateImageSize } from '../utils/fileValidator';
import './BucketList.css';

export default function BucketList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (creating new goal)
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Completion modal states
  const [completingItem, setCompletingItem] = useState(null);
  const [completionFile, setCompletionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const minhaRole = localStorage.getItem('role') || '';
  
  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarDesejos();
  }, [navigate]);

  const carregarDesejos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await funService.getBucketItems();
      setItems(data);
    } catch (err) {
      setError(t.bucket_error_load || 'Erro ao carregar a lista de desejos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert(t.bucket_input_title || 'O título do desejo é obrigatório!');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const newItem = await funService.createBucketItem({
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setItems([newItem, ...items]);
      setNewTitle('');
      setNewDescription('');
      setShowCreator(false);
      alert(t.bucket_success_created || 'Desejo adicionado!');
    } catch (err) {
      setError(t.bucket_error_save || 'Erro ao criar desejo.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (item) => {
    if (item.completed) {
      const confirmMsg = t.bucket_uncomplete_confirm || 'Queres marcar este desejo como não cumprido? (A foto associada será apagada)';
      if (!window.confirm(confirmMsg)) return;

      try {
        setError('');
        const updated = await funService.completeBucketItem(item._id, { completed: false });
        setItems(items.map(i => i._id === item._id ? updated : i));
      } catch (err) {
        setError(t.bucket_error_complete || 'Erro ao atualizar desejo.');
      }
    } else {
      setCompletingItem(item);
      setCompletionFile(null);
    }
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!completingItem) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('completed', true);
      if (completionFile) {
        formData.append('image', completionFile);
      }

      const updated = await funService.completeBucketItem(completingItem._id, formData);
      setItems(items.map(i => i._id === completingItem._id ? updated : i));
      setCompletingItem(null);
      setCompletionFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setError(t.bucket_error_complete || 'Erro ao concluir desejo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.bucket_confirm_delete || 'Tens a certeza que queres eliminar este desejo?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      await funService.deleteBucketItem(id);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      setError(t.bucket_error_delete || 'Erro ao eliminar desejo.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImageSize(file, 5)) {
        alert(language === 'pt' ? 'O tamanho máximo da imagem é de 5MB.' : 'Maximum image size is 5MB.');
        fileInputRef.current.value = null;
        setCompletionFile(null);
        return;
      }
      setCompletionFile(file);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const formatDate = (dateStr) => {
    return formatDateLong(dateStr, language === 'pt' ? 'pt' : 'en');
  };

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="bucket-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="bucket-page-title">{t.bucket_title || 'Lista de Desejos 📝'}</h1>
        <div style={{ width: '100px' }} className="header-spacer"></div>
      </div>

      <p className="bucket-subtitle">{t.bucket_subtitle || 'Sonhos e metas de casal'}</p>

      {error && (
        <div className="bucket-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Control Actions / Filters */}
      <BucketFilters
        filter={filter}
        setFilter={setFilter}
        items={items}
        onAddClick={() => setShowCreator(true)}
        loading={loading}
        t={t}
      />

      {/* Creator Modal/Form */}
      <BucketCreator
        showCreator={showCreator}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        creating={creating}
        onSubmit={handleCreateItem}
        onClose={() => setShowCreator(false)}
        t={t}
      />

      {/* Completion Modal */}
      <BucketCompletionModal
        completingItem={completingItem}
        completionFile={completionFile}
        uploading={uploading}
        onSubmit={handleConfirmCompletion}
        onClose={() => { setCompletingItem(null); setCompletionFile(null); }}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        language={language}
        t={t}
      />

      {/* List Container */}
      {loading ? (
        <div className="bucket-loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel empty-bucket-state">
          <p>{t.bucket_empty_state || 'Nenhum desejo na lista!'}</p>
        </div>
      ) : (
        <div className="bucket-grid fade-in">
          {filteredItems.map(item => (
            <BucketCard
              key={item._id}
              item={item}
              meuNome={meuNome}
              minhaRole={minhaRole}
              onDelete={handleDeleteItem}
              onToggleComplete={handleToggleComplete}
              formatDate={formatDate}
              language={language}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

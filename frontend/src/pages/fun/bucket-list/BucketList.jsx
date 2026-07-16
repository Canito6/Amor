import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import BucketCreator from '../../../components/bucket/BucketCreator';
import BucketCompletionModal from '../../../components/bucket/BucketCompletionModal';
import BucketCard from '../../../components/bucket/BucketCard';
import BucketFilters from '../../../components/bucket/BucketFilters';
import useBucketList from '../../../hooks/fun/useBucketList';
import EmptyState from '../../../components/shared/EmptyState';
import './BucketList.css';

export default function BucketList() {
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
    }
  }, [navigate]);

  const {
    items,
    filter,
    setFilter,
    loading,
    error,
    showCreator,
    setShowCreator,
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    creating,
    completingItem,
    setCompletingItem,
    completionFile,
    setCompletionFile,
    uploading,
    handleCreateItem,
    handleToggleComplete,
    handleConfirmCompletion,
    handleDeleteItem,
    handleFileChange,
    filteredItems,
    formatDate,
    currentPage,
    totalPages,
    loadingMore,
    carregarDesejos
  } = useBucketList(t, language, fileInputRef);

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.bucket_title || 'Lista de Desejos 📝'}</h1>
        <div className="page-header-spacer"></div>
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
        <div className="bucket-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel skeleton" style={{ height: '180px', borderRadius: '24px', border: 'none' }} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="📝"
          title={t.bucket_empty_state || 'Nenhum desejo na lista!'}
          description={language === 'pt' ? 'Criem o vosso primeiro desejo para começarem a planear metas românticas juntos.' : 'Create your first wish to start planning romantic goals together.'}
        />
      ) : (
        <>
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

          {currentPage < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                className="btn btn-dark"
                onClick={() => carregarDesejos(currentPage + 1, true)}
                disabled={loadingMore}
                style={{ padding: '12px 28px', fontSize: '15px', opacity: loadingMore ? 0.7 : 1 }}
              >
                {loadingMore ? '⏳ A carregar...' : (language === 'pt' ? 'Carregar Mais' : 'Load More')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

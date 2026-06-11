import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import WheelCreator from '../../../components/wheel/WheelCreator';
import WheelSpinner from '../../../components/wheel/WheelSpinner';
import WheelSelector from '../../../components/wheel/WheelSelector';
import useRoleta from '../../../hooks/useRoleta';
import './Roleta.css';

export default function Roleta() {
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const {
    wheels,
    selectedWheel,
    setSelectedWheel,
    loading,
    error,
    showCreator,
    setShowCreator,
    newTitle,
    setNewTitle,
    newOptions,
    creating,
    isSpinning,
    rotation,
    result,
    handleCreateWheel,
    handleDeleteWheel,
    handleAddOptionField,
    handleRemoveOptionField,
    handleOptionChange,
    spinWheel
  } = useRoleta(t);

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.wheel_title}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="wheel-subtitle">{t.wheel_subtitle}</p>

      {error && (
        <div className="wheel-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Selector and Creator */}
      <div className="wheel-config-container">
        {!showCreator ? (
          <WheelSelector
            wheels={wheels}
            selectedWheel={selectedWheel}
            onSelectWheel={setSelectedWheel}
            isSpinning={isSpinning}
            onNewClick={() => setShowCreator(true)}
            onDeleteClick={handleDeleteWheel}
            meuNome={meuNome}
            t={t}
          />
        ) : (
          <WheelCreator
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newOptions={newOptions}
            creating={creating}
            onSubmit={handleCreateWheel}
            onClose={() => setShowCreator(false)}
            t={t}
            onAddOptionField={handleAddOptionField}
            onRemoveOptionField={handleRemoveOptionField}
            onOptionChange={handleOptionChange}
          />
        )}
      </div>

      {/* Main Wheel Area */}
      {!showCreator && selectedWheel && (
        <WheelSpinner
          selectedWheel={selectedWheel}
          rotation={rotation}
          isSpinning={isSpinning}
          spinWheel={spinWheel}
          result={result}
          t={t}
        />
      )}

      {!selectedWheel && !loading && !showCreator && (
        <div className="glass-panel empty-wheel-state">
          <p>Ainda não tens roletas de decisão. Cria uma para começar!</p>
        </div>
      )}
    </div>
  );
}

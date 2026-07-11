import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoService } from '../../../services/gallery/photoService';
import { memoryService } from '../../../services/fun/memoryService';
import { eventService } from '../../../services/couple/eventService';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import './Timeline.css';

export default function Timeline() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const t = translations[language];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'photo', 'memory', 'event'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchTimelineData();
  }, [navigate]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError('');

      const [photosData, memoriesData, eventsData] = await Promise.all([
        photoService.getPhotos().catch(() => []),
        memoryService.getMemories().catch(() => []),
        eventService.getEvents().catch(() => [])
      ]);

      // Certificar que temos arrays válidos
      const photos = Array.isArray(photosData) ? photosData : [];
      const memories = Array.isArray(memoriesData) ? memoriesData : [];
      const events = Array.isArray(eventsData) ? eventsData : [];

      // Mapear fotos
      const mappedPhotos = photos.map(p => ({
        id: p._id,
        title: p.caption || (language === 'en' ? 'Photo Uploaded' : 'Foto Carregada'),
        description: '',
        date: p.createdAt,
        type: 'photo',
        url: p.url,
        createdBy: p.uploadedBy
      }));

      // Mapear memórias (filtrar cápsulas do tempo trancadas)
      const nowMs = Date.now();
      const mappedMemories = memories
        .filter(m => {
          if (m.isTimeCapsule) {
            return new Date(m.unlockDate).getTime() <= nowMs;
          }
          return true;
        })
        .map(m => ({
          id: m._id,
          title: m.title,
          description: m.description,
          date: m.date,
          type: 'memory',
          createdBy: m.createdBy,
          isTimeCapsule: m.isTimeCapsule
        }));

      // Mapear eventos
      const mappedEvents = events.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        type: 'event',
        category: e.category,
        createdBy: e.createdBy
      }));

      // Combinar e ordenar
      const combined = [...mappedPhotos, ...mappedMemories, ...mappedEvents];
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setItems(combined);
    } catch (err) {
      console.error(err);
      setError(language === 'en' ? 'Error loading timeline.' : 'Erro ao carregar a linha do tempo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventCategoryEmoji = (category) => {
    switch (category) {
      case 'aniversario': return '🎂';
      case 'viagem': return '✈️';
      case 'jantar': return '🍽️';
      default: return '🎉';
    }
  };

  // Filtrar itens por tipo
  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.timeline || 'Linha do Tempo'} 📈</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="timeline-subtitle">
        {language === 'en' 
          ? 'A chronological journey through our photos, memories, and events.' 
          : 'Uma viagem cronológica pelas nossas fotos, memórias e eventos.'}
      </p>

      {/* Filtros */}
      <div className="timeline-filters">
        <button 
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          ✨ {language === 'en' ? 'All' : 'Tudo'}
        </button>
        <button 
          className={`filter-btn ${filterType === 'photo' ? 'active' : ''}`}
          onClick={() => setFilterType('photo')}
        >
          📸 {t.photos}
        </button>
        <button 
          className={`filter-btn ${filterType === 'memory' ? 'active' : ''}`}
          onClick={() => setFilterType('memory')}
        >
          ⏳ {t.memories}
        </button>
        <button 
          className={`filter-btn ${filterType === 'event' ? 'active' : ''}`}
          onClick={() => setFilterType('event')}
        >
          📅 {t.calendar}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="timeline-error-alert">
          <p>{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel empty-timeline-panel">
          <p>
            {language === 'en' 
              ? 'No milestones found. Add photos, memories or events to see them here!' 
              : 'Nenhum marco encontrado. Adiciona fotos, memórias ou eventos para os veres aqui!'}
          </p>
        </div>
      ) : (
        <div className="timeline-container">
          <div className="timeline-spine"></div>
          
          {filteredItems.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div 
                key={`${item.type}-${item.id}`} 
                className={`timeline-item ${isLeft ? 'left-side' : 'right-side'} type-${item.type}`}
              >
                {/* Node icon */}
                <div className="timeline-node">
                  <span className="node-icon-inner">
                    {item.type === 'photo' && '📸'}
                    {item.type === 'memory' && (item.isTimeCapsule ? '🔒' : '⏳')}
                    {item.type === 'event' && getEventCategoryEmoji(item.category)}
                  </span>
                </div>

                {/* Card content */}
                <div className="timeline-card glass-panel fade-in">
                  <div className="timeline-card-header">
                    <span className="timeline-card-date">{formatDate(item.date)}</span>
                    <span className="timeline-badge">{item.type.toUpperCase()}</span>
                  </div>

                  <h3 className="timeline-card-title">{item.title}</h3>
                  
                  {item.description && (
                    <p className="timeline-card-desc">{item.description}</p>
                  )}

                  {item.type === 'photo' && item.url && (
                    <div className="timeline-card-media">
                      <img src={item.url} alt={item.title} className="timeline-image" loading="lazy" />
                    </div>
                  )}

                  <div className="timeline-card-footer">
                    <span>
                      {language === 'en' ? 'By' : 'Por'}: <strong>{item.createdBy}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

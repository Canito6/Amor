import React from 'react';
import Skeleton from '../shared/Skeleton';

export default function EventList({
  t,
  loading,
  eventosFuturos,
  eventosPassados,
  obterDiasRestantes,
  meuNome,
  minhaRole,
  obterCorCategoria,
  obterIconeCategoria,
  formatarDataExtenso,
  apagarEvento
}) {
  if (loading) {
    return (
      <div className="calendar-events-skeletons" style={{ padding: '10px 0' }}>
        <Skeleton variant="card" height="150px" style={{ marginBottom: '20px' }} />
        <Skeleton variant="card" height="150px" style={{ marginBottom: '20px' }} />
      </div>
    );
  }

  return (
    <div className="calendar-events-container">
      
      {/* EVENTOS FUTUROS */}
      <div className="glass-panel" style={{ padding: '25px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '20px', borderBottom: '2px solid rgba(255, 77, 109, 0.1)', paddingBottom: '8px' }}>
          {t.calendar_upcoming_title.replace('{count}', eventosFuturos.length)}
        </h2>

        {eventosFuturos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
            {t.calendar_upcoming_empty}
          </p>
        ) : (
          <div className="event-card-list">
            {eventosFuturos.map((evt) => {
              const diasRestantes = obterDiasRestantes(evt.date);
              const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
              const corCat = obterCorCategoria(evt.category);
              const icone = obterIconeCategoria(evt.category);

              return (
                <div 
                  key={evt._id} 
                  className="event-item-card"
                  style={{ '--event-color': corCat }}
                >
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{icone}</span>
                      <h3 style={{ fontSize: '17px', margin: 0 }}>{evt.title}</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                      📅 {formatarDataExtenso(evt.date)} | {t.calendar_event_created_by} <strong>{evt.createdBy}</strong>
                    </p>
                    {evt.description && (
                      <p className="event-description-text">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span 
                      className="event-badge-days"
                      style={{ background: corCat }}
                    >
                      {diasRestantes === 0 
                        ? t.days_remaining_today 
                        : (diasRestantes === 1 
                           ? t.days_remaining_one 
                           : t.days_remaining_many.replace('{count}', diasRestantes))}
                    </span>
                    
                    {podeApagar && (
                      <button
                        onClick={() => apagarEvento(evt._id)}
                        className="event-delete-btn"
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HISTÓRICO DE EVENTOS PASSADOS */}
      <div className="glass-panel" style={{ padding: '25px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '20px', borderBottom: '2px solid rgba(0, 0, 0, 0.05)', paddingBottom: '8px' }}>
          {t.calendar_past_title.replace('{count}', eventosPassados.length)}
        </h2>

        {eventosPassados.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
            {t.calendar_past_empty}
          </p>
        ) : (
          <div className="event-card-list" style={{ gap: '12px' }}>
            {eventosPassados.map((evt) => {
              const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
              const icone = obterIconeCategoria(evt.category);

              return (
                <div 
                  key={evt._id} 
                  className="past-event-item-card"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{icone}</span>
                      <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--text-muted)' }}>{evt.title}</h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📅 {formatarDataExtenso(evt.date)} | {t.calendar_event_created_by || (language === 'pt' ? 'Por' : 'By')}: {evt.createdBy}
                    </span>
                  </div>
                  
                  {podeApagar && (
                    <button
                      onClick={() => apagarEvento(evt._id)}
                      className="event-delete-btn"
                      style={{ fontSize: '15px' }}
                      title={t.delete}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

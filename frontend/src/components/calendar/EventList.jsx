import React from 'react';

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
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.calendar_loading}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {eventosFuturos.map((evt) => {
              const diasRestantes = obterDiasRestantes(evt.date);
              const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
              const corCat = obterCorCategoria(evt.category);
              const icone = obterIconeCategoria(evt.category);

              return (
                <div 
                  key={evt._id} 
                  style={{ 
                    padding: '20px', 
                    background: 'white', 
                    borderRadius: '18px', 
                    borderLeft: `6px solid ${corCat}`,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}
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
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', background: '#fcfcfc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0f0f0', margin: 0 }}>
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span 
                      style={{ 
                        fontSize: '14px', 
                        color: 'white', 
                        background: corCat, 
                        padding: '8px 16px', 
                        borderRadius: '12px',
                        fontWeight: '700',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                      }}
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
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger-color)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '5px'
                        }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {eventosPassados.map((evt) => {
              const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
              const icone = obterIconeCategoria(evt.category);

              return (
                <div 
                  key={evt._id} 
                  style={{ 
                    padding: '15px 20px', 
                    background: '#fafafa', 
                    borderRadius: '16px', 
                    borderLeft: `5px solid #ccc`,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    opacity: '0.85'
                  }}
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
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-color)',
                        cursor: 'pointer',
                        fontSize: '15px',
                        padding: '4px'
                      }}
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

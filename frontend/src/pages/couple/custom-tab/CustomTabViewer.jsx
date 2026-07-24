import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { useTabs } from '../../../context/TabContext';
import { translations } from '../../../services/common/translations';

export default function CustomTabViewer() {
  const { tabId } = useParams();
  const { language } = usePreferences();
  const { customTabs, updateCustomTab } = useTabs();
  const t = translations[language];

  // Encontra a aba ativa
  const tab = customTabs.find(item => item._id === tabId);

  // Estados
  const [noteContent, setNoteContent] = useState('');
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const saveTimeoutRef = useRef(null);

  // Sincroniza o editor de notas com o conteúdo da base de dados quando mudamos de aba
  useEffect(() => {
    if (tab && tab.contentType === 'notes') {
      setNoteContent(tab.content || '');
      setSyncStatus('saved');
    }
  }, [tabId, tab?.content, tab?.contentType]);

  // Limpa o timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!tab) {
    return (
      <div className="app-container fade-in" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
            {t.loading_tabs}
          </p>
        </div>
      </div>
    );
  }

  // Função para detetar e converter URLs comuns de partilha para Embeds do Iframe
  const formatEmbedUrl = (url) => {
    if (!url) return '';
    let formatted = url;

    // YouTube (Video standard)
    // Exemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      if (videoId) {
        formatted = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // YouTube Short Link
    // Exemplo: https://youtu.be/dQw4w9WgXcQ
    else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      const videoId = parts[parts.length - 1].split('?')[0];
      if (videoId) {
        formatted = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return formatted;
  };

  // Lógica de Debounce para Gravação de Notas no Backend
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    setSyncStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Gravar na base de dados 1.2 segundos após o utilizador parar de escrever
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCustomTab(tab._id, { content: val });
        setSyncStatus('saved');
      } catch {
        setSyncStatus('error');
      }
    }, 1200);
  };

  return (
    <div className="app-container fade-in" style={{ maxWidth: '900px', paddingTop: '20px' }}>
      {/* Cabeçalho da Aba */}
      <div className="glass-panel" style={{ padding: '22px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '38px' }}>{tab.icon}</span>
          <div>
            <h1 style={{ fontSize: '26px', margin: 0, color: 'var(--primary-color)' }}>
              {tab.title}
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {tab.contentType === 'notes' ? t.content_notes : (tab.contentType === 'media' ? t.content_media : t.content_link)}
            </p>
          </div>
        </div>

        {/* Indicador de Sync (Apenas para notas) */}
        {tab.contentType === 'notes' && (
          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {syncStatus === 'saving' && <span style={{ color: 'var(--secondary-color)' }}>{language === 'pt' ? '⏳ Sincronizando...' : '⏳ Syncing...'}</span>}
            {syncStatus === 'saved' && <span style={{ color: 'var(--success-color)' }}>{language === 'pt' ? '✅ Guardado na Nuvem' : '✅ Saved to Cloud'}</span>}
            {syncStatus === 'error' && <span style={{ color: 'var(--danger-color)' }}>{language === 'pt' ? '❌ Erro ao guardar' : '❌ Error saving'}</span>}
          </div>
        )}
      </div>

      {/* Renderização do Conteúdo com base no Tipo de Aba */}
      {tab.contentType === 'notes' && (
        <div className="glass-panel" style={{ padding: '25px', minHeight: '400px' }}>
          <textarea
            className="input-control"
            value={noteContent}
            onChange={handleNoteChange}
            placeholder={t.notebook_placeholder}
            style={{
              width: '100%',
              minHeight: '380px',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              boxShadow: 'none',
              resize: 'vertical',
              fontSize: '16px',
              lineHeight: '1.7',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-main)',
              padding: '0'
            }}
          />
        </div>
      )}

      {tab.contentType === 'media' && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <iframe
            style={{ borderRadius: '16px', border: 'none', background: 'rgba(0,0,0,0.05)' }}
            src={formatEmbedUrl(tab.content)}
            width="100%"
            height="450"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
          <div style={{ textAlign: 'center' }}>
            <a 
              href={tab.content} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-dark" 
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              {t.open_in_new_tab}
            </a>
          </div>
        </div>
      )}

      {tab.contentType === 'link' && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Alerta de Segurança / Iframe Block Fallback */}
          <div 
            style={{ 
              padding: '12px 18px', 
              borderRadius: '12px', 
              background: 'rgba(247, 127, 0, 0.08)', 
              border: '1px solid rgba(247, 127, 0, 0.25)', 
              fontSize: '13.5px',
              color: 'var(--text-main)' 
            }}
          >
            💡 <strong>Dica:</strong> {t.iframe_blocked_message}
            <div style={{ marginTop: '10px' }}>
              <a 
                href={tab.content} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary" 
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {t.open_in_new_tab}
              </a>
            </div>
          </div>

          <iframe
            src={tab.content}
            title={tab.title}
            style={{ 
              width: '100%', 
              height: '550px', 
              border: 'none', 
              borderRadius: '16px', 
              backgroundColor: 'white',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          ></iframe>
        </div>
      )}
    </div>
  );
}

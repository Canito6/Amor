import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import './Fotos.css';

export default function Fotos() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [generalPhotoCount, setGeneralPhotoCount] = useState(0);
  const [activeTab, setActiveTab] = useState('albums'); // 'albums' | 'todas'
  const [currentAlbum, setCurrentAlbum] = useState(null); // null ou objeto Álbum

  // Estados de formulário
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState('sem-album');
  
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  // Estados de carregamento/erros
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Lightbox

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarGaleria();
  }, [navigate]);

  // Carregar fotos sempre que muda a aba ativa ou o álbum selecionado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && (activeTab === 'todas' || currentAlbum)) {
      carregarFotos(1, false);
    }
  }, [activeTab, currentAlbum]);

  const carregarGaleria = async () => {
    try {
      setLoading(true);
      const dadosAlbums = await apiFetch('/api/albums');
      setAlbums(dadosAlbums.albums || []);
      setGeneralPhotoCount(dadosAlbums.generalPhotoCount || 0);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar a galeria.');
    } finally {
      setLoading(false);
    }
  };

  const carregarFotos = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingPhotos(true);
      }
      setErro('');

      let url = `/api/photos?page=${page}&limit=12`;
      if (currentAlbum) {
        const albumParam = currentAlbum === 'sem-album' ? 'sem-album' : currentAlbum._id;
        url += `&albumId=${albumParam}`;
      }

      const dados = await apiFetch(url);
      const novasFotos = dados.photos || [];

      if (append) {
        setPhotos(prev => [...prev, ...novasFotos]);
      } else {
        setPhotos(novasFotos);
      }

      setCurrentPage(dados.currentPage || 1);
      setTotalPages(dados.totalPages || 1);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar fotos.');
    } finally {
      setLoadingPhotos(false);
      setLoadingMore(false);
    }
  };

  const lidarComFicheiro = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t.photos_img_too_large);
        fileInputRef.current.value = null;
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const enviarFoto = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErro('');

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);
      
      const albumAlvo = currentAlbum ? currentAlbum._id : selectedAlbumId;
      if (albumAlvo && albumAlvo !== 'sem-album') {
        formData.append('albumId', albumAlvo);
      }

      const novaFoto = await apiFetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      });

      // Adicionar à lista atual de fotos exibidas se pertencer ao contexto
      const pertenceAoContexto = !currentAlbum 
        || (currentAlbum === 'sem-album' && !novaFoto.albumId)
        || (currentAlbum && currentAlbum._id === novaFoto.albumId);

      if (pertenceAoContexto) {
        setPhotos([novaFoto, ...photos]);
      }

      // Atualizar contadores de fotos reativamente
      if (novaFoto.albumId) {
        setAlbums(albums.map(a => a._id === novaFoto.albumId ? { ...a, photoCount: (a.photoCount || 0) + 1 } : a));
      } else {
        setGeneralPhotoCount(prev => prev + 1);
      }

      setCaption('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      alert(t.photos_upload_success);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar foto.');
    } finally {
      setUploading(false);
    }
  };

  const criarAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      setCreatingAlbum(true);
      setErro('');
      const novo = await apiFetch('/api/albums', {
        method: 'POST',
        body: { name: newAlbumName.trim(), description: newAlbumDesc.trim() }
      });
      // Inicializar com contagem zero de fotos
      const novoComContagem = { ...novo, photoCount: 0 };
      setAlbums([novoComContagem, ...albums]);
      setNewAlbumName('');
      setNewAlbumDesc('');
      alert(t.photos_create_album_success);
    } catch (err) {
      setErro(err.message || 'Erro ao criar álbum.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const apagarAlbum = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t.photos_delete_album_confirm)) return;

    try {
      setErro('');
      await apiFetch(`/api/albums/${id}`, {
        method: 'DELETE'
      });
      
      const albumApagado = albums.find(a => a._id === id);
      const contagemFotos = albumApagado ? (albumApagado.photoCount || 0) : 0;

      setAlbums(albums.filter((a) => a._id !== id));
      // As fotos do álbum apagado voltam para o feed geral, então incrementamos o contador Geral
      setGeneralPhotoCount(prev => prev + contagemFotos);
      
      if (currentAlbum && currentAlbum._id === id) {
        setCurrentAlbum(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar álbum.');
    }
  };

  const apagarFoto = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t.photos_delete_photo_confirm)) return;

    try {
      setErro('');
      await apiFetch(`/api/photos/${id}`, {
        method: 'DELETE'
      });

      const fotoApagada = photos.find(p => p._id === id);
      setPhotos(photos.filter((p) => p._id !== id));

      if (fotoApagada) {
        if (fotoApagada.albumId) {
          setAlbums(albums.map(a => a._id === fotoApagada.albumId ? { ...a, photoCount: Math.max(0, (a.photoCount || 1) - 1) } : a));
        } else {
          setGeneralPhotoCount(prev => Math.max(0, prev - 1));
        }
      }

      if (selectedPhoto && selectedPhoto._id === id) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar foto.');
    }
  };

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>{t.photos_title}</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '35px' }}>
        <button 
          className={`btn ${activeTab === 'albums' && !currentAlbum ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('albums'); setCurrentAlbum(null); }}
        >
          {t.photos_tab_folders}
        </button>
        <button 
          className={`btn ${activeTab === 'todas' ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('todas'); setCurrentAlbum(null); }}
        >
          {t.photos_tab_all}
        </button>
      </div>

      {/* Formulário de upload de fotos */}
      {(activeTab === 'todas' || currentAlbum) && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
            {currentAlbum 
              ? `${t.photos_add_album_prefix} "${currentAlbum === 'sem-album' ? t.photos_album_general_title : currentAlbum.name}" 📸`
              : t.photos_add_general}
          </h2>
          <form onSubmit={enviarFoto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="input-label">{t.photos_input_select}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={lidarComFicheiro}
                  required
                  className="input-control"
                  style={{ padding: '8px 12px' }}
                />
              </div>
              <div className="form-group">
                <label className="input-label">{t.photos_input_caption}</label>
                <input
                  type="text"
                  placeholder={t.photos_caption_placeholder}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-control"
                />
              </div>

              {!currentAlbum && activeTab === 'todas' && (
                <div className="form-group">
                  <label className="input-label">{t.photos_input_album}</label>
                  <select 
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="input-control"
                    style={{ appearance: 'auto' }}
                  >
                    <option value="sem-album">{t.photos_album_none}</option>
                    {albums.map((alb) => (
                      <option key={alb._id} value={alb._id}>{alb.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={uploading || !selectedFile}
                style={{ opacity: uploading || !selectedFile ? 0.7 : 1 }}
              >
                {uploading ? t.photos_sending : t.photos_send_submit}
              </button>
            </div>
          </form>
          {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
        </div>
      )}

      {/* SECÇÃO DE ÁLBUNS */}
      {activeTab === 'albums' && !currentAlbum && (
        <div>
          {/* Formulário para Criar Novo Álbum */}
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '45px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.photos_create_album_title}</h2>
            <form onSubmit={criarAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="input-label">{t.photos_input_album_name}</label>
                  <input
                    type="text"
                    placeholder={t.photos_album_name_placeholder}
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">{t.photos_input_album_desc}</label>
                  <input
                    type="text"
                    placeholder={t.photos_album_desc_placeholder}
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    className="input-control"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-secondary" disabled={creatingAlbum}>
                  {creatingAlbum ? '...' : t.photos_create_album_submit}
                </button>
              </div>
            </form>
          </div>

          <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>{t.photos_album_title}</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <p style={{ color: 'var(--text-muted)' }}>{t.photos_loading_albums}</p>
            </div>
          ) : (
            <div className="album-grid">
              {/* Cartão Fixo para Fotos Sem Álbum */}
              <div className="glass-panel album-card" onClick={() => setCurrentAlbum('sem-album')}>
                <span className="album-badge">
                  {generalPhotoCount}
                </span>
                <span className="album-icon">📂</span>
                <h3 className="album-name">{t.photos_album_general_title}</h3>
                <p className="album-desc">{t.photos_album_general_desc}</p>
              </div>

              {/* Álbuns Dinâmicos */}
              {albums.map((alb) => {
                const count = alb.photoCount || 0;
                const podeApagar = alb.createdBy === meuNome || minhaRole === 'admin';
                return (
                  <div 
                    key={alb._id} 
                    className="glass-panel album-card" 
                    onClick={() => setCurrentAlbum(alb)}
                  >
                    <span className="album-badge">{count}</span>
                    <span className="album-icon">📁</span>
                    <h3 className="album-name">{alb.name}</h3>
                    <p className="album-desc">{alb.description || t.photos_no_desc}</p>
                    {podeApagar && (
                      <button
                        onClick={(e) => apagarAlbum(e, alb._id)}
                        style={{
                          position: 'absolute',
                          bottom: '15px',
                          right: '15px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger-color)',
                          cursor: 'pointer',
                          fontSize: '14px'
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
      )}

      {/* LISTAGEM DE FOTOS */}
      {(activeTab === 'todas' || currentAlbum) && (
        <div>
          {currentAlbum && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <button 
                className="btn btn-dark" 
                onClick={() => setCurrentAlbum(null)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {t.photos_back_albums}
              </button>
              <h2 style={{ margin: 0, fontSize: '22px' }}>
                {t.photos_tab_folders.replace('📁 ', '')}: <span style={{ color: 'var(--primary-color)' }}>{currentAlbum === 'sem-album' ? t.photos_album_general_title : currentAlbum.name}</span>
              </h2>
            </div>
          )}

          {loadingPhotos ? (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.photos_loading_photos}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                {t.photos_empty_album}
              </p>
            </div>
          ) : (
            <>
              <div className="photo-grid">
                {photos.map((photo) => {
                  const podeApagar = photo.uploadedBy === meuNome || minhaRole === 'admin';
                  return (
                    <div 
                      key={photo._id} 
                      className="photo-card"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img src={photo.url} alt={photo.caption} className="photo-img" loading="lazy" />
                      <div className="photo-overlay">
                        <p className="photo-caption">{photo.caption || (language === 'pt' ? 'Sem legenda' : 'No caption')}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="photo-meta">{t.photos_lightbox_by}: {photo.uploadedBy}</span>
                          {podeApagar && (
                            <button
                              className="btn btn-danger"
                              onClick={(e) => apagarFoto(e, photo._id)}
                              style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                              title={t.delete}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Carregar Mais */}
              {currentPage < totalPages && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    className="btn btn-dark"
                    onClick={() => carregarFotos(currentPage + 1, true)}
                    disabled={loadingMore}
                    style={{ padding: '12px 28px', fontSize: '15px', opacity: loadingMore ? 0.7 : 1 }}
                  >
                    {loadingMore ? '⏳ A carregar...' : t.photos_load_more}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX */}
      {selectedPhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '36px',
              cursor: 'pointer',
              fontWeight: 'bold',
              lineHeight: 1
            }}
            onClick={() => setSelectedPhoto(null)}
          >
            &times;
          </button>

          <img 
            src={selectedPhoto.url} 
            alt={selectedPhoto.caption}
            style={{
              maxWidth: '90%',
              maxHeight: '75vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <div 
            style={{
              marginTop: '20px',
              color: 'white',
              textAlign: 'center',
              maxWidth: '600px',
              padding: '10px 20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--primary-color)', fontSize: '20px', marginBottom: '8px' }}>
              {selectedPhoto.caption || (language === 'pt' ? 'Sem legenda' : 'No caption')}
            </h3>
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              {t.photos_lightbox_by} <strong>{selectedPhoto.uploadedBy}</strong> {t.photos_lightbox_on} {new Date(selectedPhoto.createdAt).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US')}
            </p>
            {(selectedPhoto.uploadedBy === meuNome || minhaRole === 'admin') && (
              <button
                className="btn btn-danger"
                onClick={(e) => apagarFoto(e, selectedPhoto._id)}
                style={{ marginTop: '15px', padding: '8px 16px', fontSize: '13px' }}
              >
                {t.photos_lightbox_delete}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

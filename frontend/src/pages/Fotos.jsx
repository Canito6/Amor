import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Fotos() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
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
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarGaleria();
  }, [navigate]);

  const carregarGaleria = async () => {
    try {
      setLoading(true);
      const [dadosFotos, dadosAlbums] = await Promise.all([
        apiFetch('/api/photos'),
        apiFetch('/api/albums')
      ]);
      setPhotos(dadosFotos);
      setAlbums(dadosAlbums);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar a galeria.');
    } finally {
      setLoading(false);
    }
  };

  const lidarComFicheiro = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande! Escolhe uma até 5MB.');
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

      setPhotos([novaFoto, ...photos]);
      setCaption('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      alert('Foto carregada com sucesso! ☁️📸');
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
      setAlbums([novo, ...albums]);
      setNewAlbumName('');
      setNewAlbumDesc('');
      alert('Álbum criado com sucesso! 📁✨');
    } catch (err) {
      setErro(err.message || 'Erro ao criar álbum.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const apagarAlbum = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Queres apagar este álbum? As fotos serão mantidas no feed geral.')) return;

    try {
      setErro('');
      await apiFetch(`/api/albums/${id}`, {
        method: 'DELETE'
      });
      setAlbums(albums.filter((a) => a._id !== id));
      
      // Desassociar as fotos deste álbum localmente
      setPhotos(photos.map(p => p.albumId === id ? { ...p, albumId: undefined } : p));
      
      if (currentAlbum && currentAlbum._id === id) {
        setCurrentAlbum(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar álbum.');
    }
  };

  const apagarFoto = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Queres apagar esta fotografia para sempre?')) return;

    try {
      setErro('');
      await apiFetch(`/api/photos/${id}`, {
        method: 'DELETE'
      });
      setPhotos(photos.filter((p) => p._id !== id));
      if (selectedPhoto && selectedPhoto._id === id) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar foto.');
    }
  };

  // Filtragem local de fotos
  const photosExibidas = currentAlbum 
    ? (currentAlbum === 'sem-album' 
        ? photos.filter(p => !p.albumId) 
        : photos.filter(p => p.albumId === currentAlbum._id))
    : photos;

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>Galeria de Fotos 📸</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '35px' }}>
        <button 
          className={`btn ${activeTab === 'albums' && !currentAlbum ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('albums'); setCurrentAlbum(null); }}
        >
          📁 Pastas / Álbuns
        </button>
        <button 
          className={`btn ${activeTab === 'todas' ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('todas'); setCurrentAlbum(null); }}
        >
          🖼️ Todas as Fotos
        </button>
      </div>

      {/* Formulário de upload de fotos (Só visível no feed geral ou dentro de um álbum) */}
      {(activeTab === 'todas' || currentAlbum) && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
            {currentAlbum 
              ? `Adicionar Foto a "${currentAlbum === 'sem-album' ? 'Sem Álbum' : currentAlbum.name}" 📸`
              : 'Adicionar Momento à Galeria 🖼️'}
          </h2>
          <form onSubmit={enviarFoto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="input-label">Selecionar Imagem (Até 5MB)</label>
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
                <label className="input-label">Legenda da Foto (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: O nosso piquenique..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-control"
                />
              </div>

              {/* Se estiver no feed geral, mostra dropdown para selecionar o álbum */}
              {!currentAlbum && activeTab === 'todas' && (
                <div className="form-group">
                  <label className="input-label">Associar ao Álbum</label>
                  <select 
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="input-control"
                    style={{ appearance: 'auto' }}
                  >
                    <option value="sem-album">Nenhum Álbum / Geral</option>
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
                {uploading ? 'A enviar... ☁️' : 'Enviar Fotografia ✨'}
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
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Criar Nova Pasta / Álbum 📁</h2>
            <form onSubmit={criarAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="input-label">Nome do Álbum</label>
                  <input
                    type="text"
                    placeholder="Ex: Viagem a Barcelona 2025"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    required
                    className="input-control"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Descrição Breve (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Fotos das nossas férias de Verão..."
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    className="input-control"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-secondary" disabled={creatingAlbum}>
                  {creatingAlbum ? 'A criar...' : 'Criar Álbum 📁'}
                </button>
              </div>
            </form>
          </div>

          <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>Pastas de Momentos</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <p style={{ color: 'var(--text-muted)' }}>A carregar álbuns... ⏳</p>
            </div>
          ) : (
            <div className="album-grid">
              {/* Cartão Fixo para Fotos Sem Álbum */}
              <div className="glass-panel album-card" onClick={() => setCurrentAlbum('sem-album')}>
                <span className="album-badge">
                  {photos.filter(p => !p.albumId).length}
                </span>
                <span className="album-icon">📂</span>
                <h3 className="album-name">Geral / Sem Álbum</h3>
                <p className="album-desc">Fotografias soltas no feed geral.</p>
              </div>

              {/* Álbuns Dinâmicos */}
              {albums.map((alb) => {
                const count = photos.filter(p => p.albumId === alb._id).length;
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
                    <p className="album-desc">{alb.description || 'Sem descrição.'}</p>
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
                        title="Apagar Álbum"
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

      {/* LISTAGEM DE FOTOS (Dentro de um álbum ou tab Todas as Fotos) */}
      {(activeTab === 'todas' || currentAlbum) && (
        <div>
          {currentAlbum && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <button 
                className="btn btn-dark" 
                onClick={() => setCurrentAlbum(null)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                ⬅ Voltar aos Álbuns
              </button>
              <h2 style={{ margin: 0, fontSize: '22px' }}>
                Pasta: <span style={{ color: 'var(--primary-color)' }}>{currentAlbum === 'sem-album' ? 'Geral / Sem Álbum' : currentAlbum.name}</span>
              </h2>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>A carregar fotografias... ⏳</p>
            </div>
          ) : photosExibidas.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                Ainda não há fotos nesta pasta. Comecem a carregar momentos! 📸💖
              </p>
            </div>
          ) : (
            <div className="photo-grid">
              {photosExibidas.map((photo) => {
                const podeApagar = photo.uploadedBy === meuNome || minhaRole === 'admin';
                return (
                  <div 
                    key={photo._id} 
                    className="photo-card"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.url} alt={photo.caption} className="photo-img" loading="lazy" />
                    <div className="photo-overlay">
                      <p className="photo-caption">{photo.caption || 'Sem legenda'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="photo-meta">De: {photo.uploadedBy}</span>
                        {podeApagar && (
                          <button
                            className="btn btn-danger"
                            onClick={(e) => apagarFoto(e, photo._id)}
                            style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Apagar foto"
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
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX / VISUALIZADOR DE FOTO */}
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
              {selectedPhoto.caption || 'Sem legenda'}
            </h3>
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              Enviada por <strong>{selectedPhoto.uploadedBy}</strong> em {new Date(selectedPhoto.createdAt).toLocaleDateString('pt-PT')}
            </p>
            {(selectedPhoto.uploadedBy === meuNome || minhaRole === 'admin') && (
              <button
                className="btn btn-danger"
                onClick={(e) => apagarFoto(e, selectedPhoto._id)}
                style={{ marginTop: '15px', padding: '8px 16px', fontSize: '13px' }}
              >
                🗑️ Apagar esta fotografia
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

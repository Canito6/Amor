import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Fotos() {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Para o modal Lightbox
  
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

    carregarFotos();
  }, [navigate]);

  const carregarFotos = async () => {
    try {
      setLoading(true);
      const dados = await apiFetch('/api/photos');
      setPhotos(dados);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar fotos.');
    } finally {
      setLoading(false);
    }
  };

  const lidarComFicheiro = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (máx 5MB)
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

      const novaFoto = await apiFetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      });

      setPhotos([novaFoto, ...photos]);
      setCaption('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      alert('Foto carregada com sucesso no Cloudinary! ☁️📸');
    } catch (err) {
      setErro(err.message || 'Erro ao carregar foto.');
    } finally {
      setUploading(false);
    }
  };

  const apagarFoto = async (e, id) => {
    e.stopPropagation(); // Evita abrir o visualizador ao carregar no botão de apagar
    if (!window.confirm('Queres apagar esta fotografia para sempre do Cantinho e do Cloudinary?')) return;

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

  return (
    <div className="app-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>Galeria de Fotos 📸</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Adicionar Momento à Galeria 🖼️</h2>
        <form onSubmit={enviarFoto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
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
                placeholder="Ex: O nosso primeiro piquenique..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-control"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploading || !selectedFile}
              style={{ opacity: uploading || !selectedFile ? 0.7 : 1 }}
            >
              {uploading ? 'A enviar para o Cloudinary... ☁️' : 'Enviar Fotografia ✨'}
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>A carregar o álbum de fotografias... ⏳</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Ainda não há fotos no Cantinho. Façam upload de um momento feliz! 💖</p>
        </div>
      ) : (
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
          {/* Botão fechar */}
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

          {/* Imagem em tamanho grande */}
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
            onClick={(e) => e.stopPropagation()} // impede fechar ao carregar na foto
          />

          {/* Detalhes da Foto */}
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

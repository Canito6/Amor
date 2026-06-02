import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoService } from '../services/photoService';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import PhotoUploader from '../components/photos/PhotoUploader';
import AlbumCreator from '../components/photos/AlbumCreator';
import AlbumGrid from '../components/photos/AlbumGrid';
import PhotoGrid from '../components/photos/PhotoGrid';
import PhotoLightbox from '../components/photos/PhotoLightbox';
import { validateImageSize } from '../utils/fileValidator';
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
      const dadosAlbums = await photoService.getAlbums();
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

      const albumParam = currentAlbum ? (currentAlbum === 'sem-album' ? 'sem-album' : currentAlbum._id) : null;
      const dados = await photoService.getPhotos(page, 12, albumParam);
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
      if (!validateImageSize(file, 5)) {
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

      const novaFoto = await photoService.uploadPhoto(formData);

      // Adicionar à lista atual de fotos exibidas se pertencer ao contexto
      const pertenceAoContexto = !currentAlbum 
        || (currentAlbum === 'sem-album' && !novaFoto.albumId)
        || (currentAlbum && currentAlbum._id === novaFoto.albumId);

      if (pertenceAoContexto) {
        setPhotos([novaFoto, ...photos]);
      }

      // Otimização: Atualizar contadores de fotos reativamente
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
      const novo = await photoService.createAlbum(newAlbumName.trim(), newAlbumDesc.trim());
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
      await photoService.deleteAlbum(id);
      
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
      await photoService.deletePhoto(id);

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
      <PhotoUploader
        t={t}
        activeTab={activeTab}
        currentAlbum={currentAlbum}
        selectedAlbumId={selectedAlbumId}
        setSelectedAlbumId={setSelectedAlbumId}
        albums={albums}
        caption={caption}
        setCaption={setCaption}
        uploading={uploading}
        selectedFile={selectedFile}
        lidarComFicheiro={lidarComFicheiro}
        enviarFoto={enviarFoto}
        fileInputRef={fileInputRef}
        erro={erro}
      />

      {/* SECÇÃO DE ÁLBUNS */}
      {activeTab === 'albums' && !currentAlbum && (
        <div>
          {/* Formulário para Criar Novo Álbum */}
          <AlbumCreator
            t={t}
            newAlbumName={newAlbumName}
            setNewAlbumName={setNewAlbumName}
            newAlbumDesc={newAlbumDesc}
            setNewAlbumDesc={setNewAlbumDesc}
            creatingAlbum={creatingAlbum}
            criarAlbum={criarAlbum}
          />

          <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>{t.photos_album_title}</h2>
          
          <AlbumGrid
            t={t}
            loading={loading}
            albums={albums}
            generalPhotoCount={generalPhotoCount}
            setCurrentAlbum={setCurrentAlbum}
            meuNome={meuNome}
            minhaRole={minhaRole}
            apagarAlbum={apagarAlbum}
          />
        </div>
      )}

      {/* LISTAGEM DE FOTOS */}
      {(activeTab === 'todas' || currentAlbum) && (
        <PhotoGrid
          t={t}
          loadingPhotos={loadingPhotos}
          photos={photos}
          currentAlbum={currentAlbum}
          setCurrentAlbum={setCurrentAlbum}
          meuNome={meuNome}
          minhaRole={minhaRole}
          language={language}
          apagarFoto={apagarFoto}
          setSelectedPhoto={setSelectedPhoto}
          currentPage={currentPage}
          totalPages={totalPages}
          loadingMore={loadingMore}
          carregarFotos={carregarFotos}
        />
      )}

      {/* MODAL LIGHTBOX */}
      <PhotoLightbox
        t={t}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
        meuNome={meuNome}
        minhaRole={minhaRole}
        language={language}
        apagarFoto={apagarFoto}
      />
    </div>
  );
}
